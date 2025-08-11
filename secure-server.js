require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const bcryptjs = require('bcryptjs');

// Import Models
const User = require('./models/User');
const SecureAccess = require('./models/SecureAccess');

const app = express();
const PORT = process.env.PORT || 3000;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.razorpay.com"]
    }
  }
}));

// Rate limiting
const createAccountLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 account creation requests per windowMs
  message: {
    success: false,
    error: 'Too many account creation attempts, please try again later'
  }
});

const otpVerificationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 OTP verification attempts per windowMs
  message: {
    success: false,
    error: 'Too many OTP verification attempts, please try again later'
  }
});

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shopify_secure_access', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Session configuration with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'secure-shopify-guide-2024',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/shopify_secure_access'
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    httpOnly: true
  }
}));

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('public'));

// CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'https://your-domain.com',
    process.env.FRONTEND_URL
  ].filter(Boolean);
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

// Razorpay configuration
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_svuJcv020PyvU9',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 's5ffeTjwaDB0MSbBm6yZvjoN'
});

// Email configuration
let transporter;

const initializeEmailTransporter = async () => {
  try {
    if (process.env.GMAIL_APP_PASSWORD) {
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER || 'code.commerce999@gmail.com',
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });
      
      await transporter.verify();
      console.log('✅ Email service initialized: Gmail');
      return true;
    }
    
    // Fallback to Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    
    console.log('✅ Email service initialized: Ethereal (test)');
    console.log(`📧 Test account: ${testAccount.user}`);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to initialize email service:', error.message);
    return false;
  }
};

// Course content configuration
const courseContent = {
  title: 'Shopify Video Intro Guide - Liquid Programming Tutorial',
  description: 'Master advanced Liquid templating to add cinematic video intros to Shopify stores',
  price: 599, // INR
  files: [
    {
      name: 'video-intro.liquid',
      description: 'Complete Liquid snippet for video intro functionality',
      type: 'code',
      content: '/* Complete Liquid code will be provided upon purchase */'
    },
    {
      name: 'settings_schema.json',
      description: 'Theme settings configuration for video intro customization',
      type: 'json',
      content: '/* Settings schema will be provided upon purchase */'
    },
    {
      name: 'Implementation-Guide.md',
      description: 'Complete step-by-step implementation guide',
      type: 'markdown',
      content: '# Implementation guide will be provided upon purchase'
    }
  ]
};

// Utility Functions
function generateDeviceFingerprint(req) {
  const userAgent = req.get('User-Agent') || 'unknown';
  const acceptLanguage = req.get('Accept-Language') || 'unknown';
  const acceptEncoding = req.get('Accept-Encoding') || 'unknown';
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  
  return crypto.createHash('sha256')
    .update(userAgent + acceptLanguage + acceptEncoding + ip)
    .digest('hex');
}

// Routes

// Home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
  try {
    const options = {
      amount: courseContent.price * 100, // Amount in paise
      currency: 'INR',
      receipt: `shopify_guide_${Date.now()}`,
      notes: {
        course: 'Shopify Video Intro Guide',
        description: 'Liquid Programming Tutorial'
      }
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: razorpay.key_id
    });

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
});

// Verify payment and create secure access token
app.post('/api/verify-payment', async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      customer_email
    } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpay.key_secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        error: 'Payment verification failed'
      });
    }

    // Create secure access token
    const secureAccess = new SecureAccess({
      token: SecureAccess.generateSecureToken(),
      email: customer_email,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      amount: courseContent.price,
      deviceFingerprint: generateDeviceFingerprint(req),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent')
    });

    await secureAccess.save();

    // Send secure access email
    await sendSecureAccessEmail(customer_email, secureAccess.token);

    console.log(`✅ Secure access created for: ${customer_email} (Token: ${secureAccess.token.substring(0, 16)}...)`);

    res.json({
      success: true,
      message: 'Payment verified successfully! Check your email for secure access instructions.',
      payment_id: razorpay_payment_id
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment verification failed'
    });
  }
});

// Secure access verification endpoint
app.get('/api/secure-access/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const deviceFingerprint = generateDeviceFingerprint(req);

    // Find the secure access token
    const secureAccess = await SecureAccess.findOne({ token });

    if (!secureAccess) {
      return res.status(404).json({
        success: false,
        error: 'Invalid access token. Please check your email for the correct link.',
        action: 'check_email'
      });
    }

    // Check if token is valid
    if (!secureAccess.isValidToken()) {
      let reason = 'Token is no longer valid.';
      if (secureAccess.isUsed) reason = 'This access link has already been used.';
      else if (secureAccess.isExpired) reason = 'This access link has expired.';
      else if (secureAccess.isBlocked) reason = 'This access link has been blocked due to security reasons.';
      else if (secureAccess.accessAttempts >= secureAccess.maxAccessAttempts) reason = 'Too many access attempts.';

      return res.status(403).json({
        success: false,
        error: reason,
        action: 'contact_support'
      });
    }

    // Update access attempts and device info
    secureAccess.accessAttempts += 1;
    secureAccess.deviceFingerprint = deviceFingerprint;
    secureAccess.ipAddress = clientIP;
    secureAccess.userAgent = userAgent;
    secureAccess.lastAccessedAt = new Date();

    // Generate and send OTP
    const otpCode = secureAccess.generateOTP();
    await secureAccess.save();

    // Send OTP email
    await sendOTPEmail(secureAccess.email, otpCode);

    res.json({
      success: true,
      message: 'Access token verified. An OTP has been sent to your email.',
      requiresOTP: true,
      email: secureAccess.email.replace(/(.{2}).*(@.*)/, '$1***$2'), // Mask email
      tokenValid: true
    });

  } catch (error) {
    console.error('Secure access verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify access token'
    });
  }
});

// OTP verification endpoint
app.post('/api/verify-otp/:token', otpVerificationLimiter, async (req, res) => {
  try {
    const { token } = req.params;
    const { otp } = req.body;
    const deviceFingerprint = generateDeviceFingerprint(req);

    if (!otp || otp.length !== 6) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid 6-digit OTP'
      });
    }

    // Find the secure access token
    const secureAccess = await SecureAccess.findOne({ token });

    if (!secureAccess) {
      return res.status(404).json({
        success: false,
        error: 'Invalid access token'
      });
    }

    // Verify device fingerprint matches
    if (secureAccess.deviceFingerprint !== deviceFingerprint) {
      secureAccess.isBlocked = true;
      await secureAccess.save();
      
      return res.status(403).json({
        success: false,
        error: 'Security violation: Device fingerprint mismatch. Access blocked.'
      });
    }

    // Verify OTP
    const otpVerified = secureAccess.verifyOTP(otp);
    await secureAccess.save();

    if (!otpVerified) {
      const remainingAttempts = secureAccess.maxOtpAttempts - secureAccess.otpAttempts;
      
      if (secureAccess.isBlocked) {
        return res.status(403).json({
          success: false,
          error: 'Too many incorrect OTP attempts. Access blocked for security.',
          action: 'contact_support'
        });
      }

      return res.status(400).json({
        success: false,
        error: `Incorrect OTP. ${remainingAttempts} attempts remaining.`,
        remainingAttempts
      });
    }

    // OTP verified successfully - create secure session
    const sessionToken = crypto.randomBytes(32).toString('hex');
    
    // Store session in database or memory (for production, use Redis)
    req.session.secureAccess = {
      token: sessionToken,
      email: secureAccess.email,
      accessTokenId: secureAccess._id,
      createdAt: new Date(),
      deviceFingerprint
    };

    res.json({
      success: true,
      message: 'OTP verified successfully! You can now access your content.',
      sessionToken,
      redirectTo: `/secure-content/${sessionToken}`
    });

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify OTP'
    });
  }
});

// Secure content delivery endpoint
app.get('/secure-content/:sessionToken', async (req, res) => {
  try {
    const { sessionToken } = req.params;
    
    // Verify session
    if (!req.session.secureAccess || req.session.secureAccess.token !== sessionToken) {
      return res.status(403).send(generateErrorPage('Unauthorized access', 'Your session is invalid or has expired.'));
    }

    const deviceFingerprint = generateDeviceFingerprint(req);
    if (req.session.secureAccess.deviceFingerprint !== deviceFingerprint) {
      return res.status(403).send(generateErrorPage('Security violation', 'Device verification failed.'));
    }

    // Find and update secure access record
    const secureAccess = await SecureAccess.findById(req.session.secureAccess.accessTokenId);
    
    if (!secureAccess || !secureAccess.otpVerified) {
      return res.status(403).send(generateErrorPage('Access denied', 'Invalid access credentials.'));
    }

    // Track content access
    secureAccess.trackContentAccess();
    await secureAccess.save();

    // Check if max downloads exceeded
    if (secureAccess.isUsed) {
      // Invalidate session
      req.session.destroy();
    }

    res.send(generateSecureContentPage(secureAccess));

  } catch (error) {
    console.error('Secure content delivery error:', error);
    res.status(500).send(generateErrorPage('Server error', 'Failed to load content.'));
  }
});

// Download endpoint for individual files
app.get('/api/download/:sessionToken/:filename', async (req, res) => {
  try {
    const { sessionToken, filename } = req.params;
    
    // Verify session
    if (!req.session.secureAccess || req.session.secureAccess.token !== sessionToken) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access'
      });
    }

    const deviceFingerprint = generateDeviceFingerprint(req);
    if (req.session.secureAccess.deviceFingerprint !== deviceFingerprint) {
      return res.status(403).json({
        success: false,
        error: 'Device verification failed'
      });
    }

    // Find secure access record
    const secureAccess = await SecureAccess.findById(req.session.secureAccess.accessTokenId);
    
    if (!secureAccess || !secureAccess.otpVerified) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Find the requested file
    const file = courseContent.files.find(f => f.name === filename);
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Set download headers
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', 'text/plain');
    
    // Return actual file content (replace with real content in production)
    res.send(file.content);

  } catch (error) {
    console.error('File download error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to download file'
    });
  }
});

// Email Functions
async function sendSecureAccessEmail(email, token) {
  if (!transporter) return;

  const accessUrl = `${process.env.BASE_URL || 'http://localhost:3000'}/access?token=${token}`;

  const mailOptions = {
    from: {
      name: 'Code & Commerce Support',
      address: process.env.GMAIL_USER || 'code.commerce999@gmail.com'
    },
    to: email,
    subject: 'Your Secure Course Access - Action Required',
    text: `
Thank you for your purchase of the Shopify Video Intro Guide!

Your payment has been confirmed and your secure access is ready.

IMPORTANT: This link expires in 10 minutes for security.

Access your content here: ${accessUrl}

For security, you'll need to:
1. Click the link above
2. Verify with a one-time code sent to this email
3. Download your content immediately

Need help? Reply to this email.

Code & Commerce Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">Your Secure Course Access</h2>
        <p>Thank you for purchasing the Shopify Video Intro Guide!</p>
        
        <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #d32f2f;">⚠️ IMPORTANT - Action Required</h3>
          <p><strong>This secure link expires in 10 minutes.</strong></p>
          <p>Click below to access your content:</p>
          <a href="${accessUrl}" style="background: #1976d2; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 10px 0;">Access Content Now</a>
        </div>
        
        <h3>Security Process:</h3>
        <ol>
          <li>Click the access link above</li>
          <li>Verify with a one-time code (sent to this email)</li>
          <li>Download your content immediately</li>
        </ol>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Need help? Reply to this email.<br>
          Code & Commerce Team
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Secure access email sent to: ${email} (${info.messageId})`);
    return info;
  } catch (error) {
    console.error('❌ Failed to send secure access email:', error.message);
    throw error;
  }
}

async function sendOTPEmail(email, otpCode) {
  if (!transporter) return;

  const mailOptions = {
    from: {
      name: 'Code & Commerce Support',
      address: process.env.GMAIL_USER || 'code.commerce999@gmail.com'
    },
    to: email,
    subject: 'Your Course Access Code',
    text: `
Your secure access code is: ${otpCode}

This code expires in 10 minutes.

Enter this code on the access page to download your Shopify Video Intro Guide.

Code & Commerce Team
    `,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center;">
        <h2 style="color: #333;">Your Access Code</h2>
        
        <div style="background: #f0f8ff; padding: 30px; border-radius: 8px; margin: 20px 0;">
          <h1 style="color: #1976d2; font-size: 48px; margin: 0; letter-spacing: 8px;">${otpCode}</h1>
          <p style="color: #666; margin-top: 15px;">This code expires in 10 minutes</p>
        </div>
        
        <p>Enter this code on the access page to download your Shopify Video Intro Guide.</p>
        
        <p style="color: #666; font-size: 14px; margin-top: 30px;">
          Code & Commerce Team
        </p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to: ${email} (${info.messageId})`);
    return info;
  } catch (error) {
    console.error('❌ Failed to send OTP email:', error.message);
    throw error;
  }
}

// HTML Page Generators
function generateErrorPage(title, message) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title} - Shopify Video Intro Guide</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                padding: 20px;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .container {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 40px;
                max-width: 500px;
                text-align: center;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            h1 {
                font-size: 1.8rem;
                margin-bottom: 15px;
            }
            p {
                font-size: 1.1rem;
                line-height: 1.6;
                margin-bottom: 30px;
            }
            .btn {
                background: linear-gradient(135deg, #ff6b6b, #ee5a52);
                color: white;
                padding: 15px 30px;
                border: none;
                border-radius: 8px;
                text-decoration: none;
                font-size: 1rem;
                font-weight: 600;
                display: inline-block;
                transition: transform 0.3s ease;
            }
            .btn:hover {
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon">❌</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <a href="/" class="btn">Return Home</a>
        </div>
    </body>
    </html>
  `;
}

function generateSecureContentPage(secureAccess) {
  const downloadLinks = courseContent.files.map(file => 
    `<a href="/api/download/${secureAccess.token}/${file.name}" class="download-btn">${file.name}</a>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Secure Content Access - Shopify Video Intro Guide</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                margin: 0;
                padding: 20px;
                min-height: 100vh;
            }
            .container {
                max-width: 800px;
                margin: 0 auto;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 15px;
                padding: 40px;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.2);
            }
            .header {
                text-align: center;
                margin-bottom: 40px;
            }
            .success-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            .download-section {
                background: rgba(0, 0, 0, 0.2);
                border-radius: 10px;
                padding: 30px;
                margin: 30px 0;
            }
            .download-btn {
                display: block;
                background: linear-gradient(135deg, #4CAF50, #45a049);
                color: white;
                padding: 15px 20px;
                margin: 10px 0;
                text-decoration: none;
                border-radius: 8px;
                transition: transform 0.3s ease;
                text-align: center;
            }
            .download-btn:hover {
                transform: translateY(-2px);
            }
            .warning {
                background: rgba(255, 152, 0, 0.2);
                border: 1px solid rgba(255, 152, 0, 0.5);
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin: 30px 0;
            }
            .info-card {
                background: rgba(0, 0, 0, 0.2);
                padding: 20px;
                border-radius: 8px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="success-icon">🎉</div>
                <h1>Welcome to Your Secure Content!</h1>
                <p>Access verified for: ${secureAccess.email}</p>
            </div>

            <div class="warning">
                <h3>⚠️ Important Security Notice</h3>
                <p><strong>This is a one-time access session.</strong> Download all files now as this link will expire after use or when you close this browser.</p>
            </div>

            <div class="download-section">
                <h2>📁 Your Course Files</h2>
                <p>Click each link below to download your files:</p>
                ${downloadLinks}
            </div>

            <div class="info-grid">
                <div class="info-card">
                    <h3>📈 Purchase Details</h3>
                    <p>Order: ${secureAccess.orderId}</p>
                    <p>Payment: ${secureAccess.paymentId}</p>
                </div>
                <div class="info-card">
                    <h3>📊 Access Info</h3>
                    <p>Downloads: ${secureAccess.downloadCount}/${secureAccess.maxDownloads}</p>
                    <p>First Access: ${secureAccess.firstAccessedAt?.toLocaleString()}</p>
                </div>
                <div class="info-card">
                    <h3>📞 Support</h3>
                    <p>Need help?</p>
                    <p>code.commerce999@gmail.com</p>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <p style="color: #ccc; font-size: 14px;">
                    Thank you for your purchase! Enjoy your Shopify Video Intro Guide.
                </p>
            </div>
        </div>

        <script>
            // Security: Prevent right-click and key combinations
            document.addEventListener('contextmenu', e => e.preventDefault());
            document.addEventListener('keydown', e => {
                if (e.key === 'F12' || 
                    (e.ctrlKey && (e.key === 'u' || e.key === 's' || e.key === 'a')) ||
                    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'C' || e.key === 'J'))) {
                    e.preventDefault();
                    return false;
                }
            });

            // Warning before leaving
            window.addEventListener('beforeunload', (e) => {
                e.returnValue = 'Are you sure you want to leave? This secure session will expire.';
            });
        </script>
    </body>
    </html>
  `;
}

// Error handling
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
async function startServer() {
  try {
    // Initialize email transporter
    await initializeEmailTransporter();
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Secure server running on port ${PORT}`);
      console.log(`📧 Email service: ${transporter ? 'Ready' : 'Not configured'}`);
      console.log(`🔒 Security: Enhanced with OTP verification`);
      console.log(`💾 Database: MongoDB connected`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
