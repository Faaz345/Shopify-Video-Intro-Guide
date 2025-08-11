require('dotenv').config();
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection for session storage in production
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopify-guide';

// Production session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'shopify-video-intro-admin-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        ttl: 24 * 60 * 60 // 1 day
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

// CORS configuration for production
app.use((req, res, next) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS ? 
        process.env.ALLOWED_ORIGINS.split(',') : 
        ['http://localhost:3000'];
    
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Razorpay configuration
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// JWT Secret
const GUIDE_JWT_SECRET = process.env.GUIDE_JWT_SECRET || 'my_super_secret_jwt_key_for_development_2024';

// Email configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    }
});

// Course price
const COURSE_PRICE = parseInt(process.env.COURSE_PRICE || '599');

// ============= PAYMENT ROUTES =============

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Create Razorpay order
app.post('/api/create-order', async (req, res) => {
    try {
        const options = {
            amount: COURSE_PRICE * 100,
            currency: 'INR',
            receipt: `shopify_guide_${Date.now()}`
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

// Verify payment
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

        // Generate JWT token
        const jwtToken = jwt.sign({
            email: customer_email,
            isPaid: true,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            purchaseDate: new Date().toISOString(),
            courseAccess: 'shopify-video-intro-guide'
        }, GUIDE_JWT_SECRET, { 
            algorithm: 'HS256',
            expiresIn: '30d' 
        });

        // Create access URL
        const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
        const accessUrl = `${BASE_URL}/guide/access?token=${jwtToken}`;

        // Send email
        await sendAccessEmail(customer_email, {
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            accessUrl: accessUrl
        });

        res.json({
            success: true,
            message: 'Payment verified! Check your email for guide access.',
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

// ============= PROTECTED GUIDE ROUTES =============

// Authentication middleware
function requireAuth(req, res, next) {
    const token = req.cookies.shopifyGuideAccess;
    
    if (!token) {
        return res.status(401).sendFile(path.join(__dirname, 'public', 'access-denied.html'));
    }
    
    try {
        const decoded = jwt.verify(token, GUIDE_JWT_SECRET);
        if (!decoded.isPaid || !decoded.email) {
            throw new Error('Invalid token');
        }
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('shopifyGuideAccess');
        return res.status(401).sendFile(path.join(__dirname, 'public', 'session-expired.html'));
    }
}

// Set JWT cookie from URL token
app.get('/guide/access', (req, res) => {
    const { token } = req.query;
    
    if (!token) {
        return res.status(400).send('No token provided');
    }
    
    try {
        const decoded = jwt.verify(token, GUIDE_JWT_SECRET);
        
        res.cookie('shopifyGuideAccess', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        
        res.redirect('/guide');
        
    } catch (error) {
        res.status(401).sendFile(path.join(__dirname, 'public', 'invalid-token.html'));
    }
});

// Protected guide route
app.get('/guide', requireAuth, (req, res) => {
    const guidePath = path.join(__dirname, 'video-intro-guide-shopify', 'index.html');
    
    fs.readFile(guidePath, 'utf8', (err, html) => {
        if (err) {
            return res.status(500).send('Error loading guide');
        }
        
        // Add authenticated banner
        const authenticatedHtml = html.replace('<body>', `
            <body>
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: linear-gradient(90deg, #4CAF50, #45a049);
                color: white;
                padding: 10px;
                text-align: center;
                z-index: 1000;
                font-family: 'Inter', sans-serif;
                font-size: 14px;
            ">
                ✅ Licensed to: ${req.user.email} | Valid until: ${new Date(req.user.exp * 1000).toLocaleDateString()}
            </div>
            <div style="height: 40px;"></div>
        `);
        
        res.send(authenticatedHtml);
    });
});

// Serve guide assets
app.use('/guide/Images', requireAuth, express.static(path.join(__dirname, 'video-intro-guide-shopify', 'Images')));
app.use('/guide/assets', requireAuth, express.static(path.join(__dirname, 'video-intro-guide-shopify')));

// Success page
app.get('/success', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Email sending function
async function sendAccessEmail(email, details) {
    const mailOptions = {
        from: {
            name: 'Code & Commerce',
            address: process.env.GMAIL_USER
        },
        to: email,
        subject: 'Your Shopify Video Intro Guide Access',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Thank you for your purchase!</h2>
                <p>Your payment has been confirmed.</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Payment ID:</strong> ${details.payment_id}</p>
                    <p><strong>Order ID:</strong> ${details.order_id}</p>
                </div>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${details.accessUrl}" style="background: #007cba; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                        Access Your Guide
                    </a>
                </div>
                <p style="color: #666; font-size: 12px;">This link is valid for 30 days and is tied to your email address.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Access email sent to:', email);
    } catch (error) {
        console.error('Email error:', error);
    }
}

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
    ======================================
    🚀 PRODUCTION SERVER STARTED
    ======================================
    Port: ${PORT}
    Environment: ${process.env.NODE_ENV || 'development'}
    Base URL: ${process.env.BASE_URL || 'http://localhost:' + PORT}
    ======================================
    `);
});
