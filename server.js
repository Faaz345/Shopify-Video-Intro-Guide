const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const User = require('./models/User');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Serve static files
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
});

// Generate device fingerprint
function generateDeviceFingerprint(req) {
  const components = [
    req.headers['user-agent'] || '',
    req.headers['accept-language'] || '',
    req.headers['accept-encoding'] || '',
    req.ip || req.connection.remoteAddress || '',
  ].join('|');
  
  return crypto.createHash('sha256').update(components).digest('hex');
}

// Middleware to verify JWT and device
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isPaid || user.isBlocked) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check device fingerprint
    const currentFingerprint = generateDeviceFingerprint(req);
    if (user.deviceFingerprint !== currentFingerprint) {
      // Block the user for suspicious activity
      user.isBlocked = true;
      await user.save();
      return res.status(403).json({ error: 'Access denied - device mismatch' });
    }
    
    // Update last access
    user.lastAccess = new Date();
    user.accessCount += 1;
    await user.save();
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Create payment order
app.post('/api/create-order', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    
    // Check if user already exists and is paid
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isPaid) {
      return res.status(400).json({ error: 'User already has access' });
    }
    
    const deviceFingerprint = generateDeviceFingerprint(req);
    const options = {
      amount: parseInt(process.env.PAYMENT_AMOUNT), // amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    };
    
    const order = await razorpay.orders.create(options);
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });
    
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Verify payment and create user
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { 
      paymentId, 
      orderId, 
      signature, 
      email, 
      password 
    } = req.body;
    
    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    if (expectedSignature !== signature) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
    
    // Get device info
    const deviceFingerprint = generateDeviceFingerprint(req);
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Create access token
    const accessToken = crypto.randomBytes(32).toString('hex');
    
    // Create or update user
    let user = await User.findOne({ email });
    if (user) {
      user.paymentId = paymentId;
      user.orderId = orderId;
      user.isPaid = true;
      user.accessToken = accessToken;
      user.deviceFingerprint = deviceFingerprint;
      user.ipAddress = ipAddress;
      user.userAgent = userAgent;
    } else {
      user = new User({
        email,
        password,
        paymentId,
        orderId,
        isPaid: true,
        accessToken,
        deviceFingerprint,
        ipAddress,
        userAgent
      });
    }
    
    await user.save();
    
    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token,
      accessUrl: `${process.env.FRONTEND_URL}?access=${accessToken}`,
      message: 'Payment verified successfully'
    });
    
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
});

// Validate access
app.get('/api/validate-access', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: {
      email: req.user.email,
      lastAccess: req.user.lastAccess,
      accessCount: req.user.accessCount
    }
  });
});

// Login for existing users
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !user.isPaid) {
      return res.status(401).json({ error: 'Invalid credentials or no access' });
    }
    
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check device fingerprint
    const currentFingerprint = generateDeviceFingerprint(req);
    if (user.deviceFingerprint !== currentFingerprint) {
      return res.status(403).json({ error: 'Access denied - please use the original device' });
    }
    
    if (user.isBlocked) {
      return res.status(403).json({ error: 'Account blocked due to suspicious activity' });
    }
    
    // Generate new JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );
    
    res.json({
      success: true,
      token,
      accessUrl: `${process.env.FRONTEND_URL}?access=${user.accessToken}`
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'Server running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
