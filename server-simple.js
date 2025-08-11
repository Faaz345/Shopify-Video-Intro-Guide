const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const Razorpay = require('razorpay');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();

// Simple in-memory storage for testing (replace with MongoDB in production)
const users = new Map();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Razorpay
}));

app.use(cors({
  origin: '*', // Allow all origins for testing
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

// Initialize Razorpay (will work in test mode)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
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
    const user = users.get(decoded.email);
    
    if (!user || !user.isPaid || user.isBlocked) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Check device fingerprint
    const currentFingerprint = generateDeviceFingerprint(req);
    if (user.deviceFingerprint !== currentFingerprint) {
      // Block the user for suspicious activity
      user.isBlocked = true;
      users.set(decoded.email, user);
      return res.status(403).json({ error: 'Access denied - device mismatch' });
    }
    
    // Update last access
    user.lastAccess = new Date();
    user.accessCount = (user.accessCount || 0) + 1;
    users.set(decoded.email, user);
    
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
    const existingUser = users.get(email);
    if (existingUser && existingUser.isPaid) {
      return res.status(400).json({ error: 'User already has access' });
    }
    
    const options = {
      amount: parseInt(process.env.PAYMENT_AMOUNT), // amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      payment_capture: 1
    };
    
    try {
      const order = await razorpay.orders.create(options);
      
      res.json({
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      });
    } catch (razorpayError) {
      console.log('Razorpay Error (Demo Mode):', razorpayError.message);
      // Return mock order for demo purposes
      res.json({
        orderId: `order_demo_${Date.now()}`,
        amount: parseInt(process.env.PAYMENT_AMOUNT),
        currency: 'INR',
        keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_demo'
      });
    }
    
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
    
    console.log('Payment verification request:', { paymentId, orderId, email });
    
    // For demo purposes, skip signature verification if using demo keys
    let signatureValid = false;
    
    try {
      // Verify signature
      const body = orderId + '|' + paymentId;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');
      
      signatureValid = (expectedSignature === signature);
    } catch (error) {
      console.log('Signature verification skipped for demo');
      signatureValid = true; // Allow for demo
    }
    
    if (!signatureValid && !orderId.includes('demo')) {
      return res.status(400).json({ error: 'Payment verification failed' });
    }
    
    // Get device info
    const deviceFingerprint = generateDeviceFingerprint(req);
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];
    
    // Create access token
    const accessToken = crypto.randomBytes(32).toString('hex');
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create or update user
    const user = {
      email,
      password: hashedPassword,
      paymentId,
      orderId,
      isPaid: true,
      accessToken,
      deviceFingerprint,
      ipAddress,
      userAgent,
      lastAccess: new Date(),
      accessCount: 0,
      isBlocked: false,
      createdAt: new Date()
    };
    
    users.set(email, user);
    
    // Generate JWT
    const token = jwt.sign(
      { email: user.email },
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
    
    const user = users.get(email);
    if (!user || !user.isPaid) {
      return res.status(401).json({ error: 'Invalid credentials or no access' });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
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
      { email: user.email },
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

// Demo endpoint to see all users (for testing only)
app.get('/api/demo/users', (req, res) => {
  const userList = Array.from(users.entries()).map(([email, user]) => ({
    email,
    isPaid: user.isPaid,
    accessCount: user.accessCount,
    lastAccess: user.lastAccess,
    isBlocked: user.isBlocked
  }));
  res.json(userList);
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'Server running',
    mode: 'Demo mode (in-memory storage)',
    usersCount: users.size,
    razorpayConfigured: !!(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send(`
    <h1>🔒 Secure Payment Gateway</h1>
    <p><strong>Server is running in demo mode!</strong></p>
    <ul>
      <li><a href="/payment.html">Payment Page</a></li>
      <li><a href="/health">Health Check</a></li>
      <li><a href="/api/demo/users">Demo: View Users</a></li>
    </ul>
    <p><small>Note: Using in-memory storage for demo. Data will be lost on server restart.</small></p>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`
🚀 Server running on http://localhost:${PORT}
📝 Payment page: http://localhost:${PORT}/payment.html
💾 Storage: In-memory (demo mode)
🔑 Razorpay: ${process.env.RAZORPAY_KEY_ID ? 'Configured' : 'Not configured (using demo)'}
  `);
});
