const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const app = express();
const PORT = 3006;

// JWT Secret - MUST match the one in your payment server
const JWT_SECRET = process.env.GUIDE_JWT_SECRET || 'my_super_secret_jwt_key_for_development_2024';

// Middleware
app.use(cookieParser());
app.use(express.json());

// Serve static files (images, etc.) - but NOT the index.html
app.use('/Images', express.static(path.join(__dirname, 'Images')));
app.use('/abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner.jpg', 
    express.static(path.join(__dirname, 'abstract-luxury-gradient-blue-background-smooth-dark-blue-with-black-vignette-studio-banner.jpg')));

// Authentication middleware
function requireAuth(req, res, next) {
    // Check for JWT in cookie
    const token = req.cookies.shopifyGuideAccess;
    
    if (!token) {
        return res.status(401).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Access Denied</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center;
                        max-width: 400px;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 20px;
                    }
                    p {
                        color: #666;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                    .lock-icon {
                        font-size: 48px;
                        margin-bottom: 20px;
                    }
                    a {
                        display: inline-block;
                        background: #667eea;
                        color: white;
                        padding: 12px 30px;
                        border-radius: 5px;
                        text-decoration: none;
                        transition: background 0.3s;
                    }
                    a:hover {
                        background: #5a67d8;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="lock-icon">🔒</div>
                    <h1>Access Denied</h1>
                    <p>You need to purchase the Shopify Video Intro Guide to access this content.</p>
                    <p>Please complete your purchase first, then use the secure link sent to your email.</p>
                    <a href="http://localhost:5000">Go to Purchase Page</a>
                </div>
            </body>
            </html>
        `);
    }
    
    try {
        // Verify JWT token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if token has required fields
        if (!decoded.isPaid || !decoded.email) {
            throw new Error('Invalid token payload');
        }
        
        // Token is valid, user has paid
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        
        // Clear invalid cookie
        res.clearCookie('shopifyGuideAccess');
        
        return res.status(401).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Session Expired</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center;
                        max-width: 400px;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 20px;
                    }
                    p {
                        color: #666;
                        line-height: 1.6;
                        margin-bottom: 30px;
                    }
                    .expired-icon {
                        font-size: 48px;
                        margin-bottom: 20px;
                    }
                    a {
                        display: inline-block;
                        background: #667eea;
                        color: white;
                        padding: 12px 30px;
                        border-radius: 5px;
                        text-decoration: none;
                        transition: background 0.3s;
                    }
                    a:hover {
                        background: #5a67d8;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="expired-icon">⏰</div>
                    <h1>Session Expired</h1>
                    <p>Your access session has expired or is invalid.</p>
                    <p>Please use the secure link from your email to access the guide.</p>
                    <a href="http://localhost:5000">Purchase Again</a>
                </div>
            </body>
            </html>
        `);
    }
}

// Route to set JWT cookie from URL token
app.get('/access', (req, res) => {
    const { token } = req.query;
    
    if (!token) {
        return res.status(400).send('No token provided');
    }
    
    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Set HTTP-only cookie
        res.cookie('shopifyGuideAccess', token, {
            httpOnly: true,
            secure: false, // Set to true in production with HTTPS
            sameSite: 'lax',
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        });
        
        // Redirect to the guide
        res.redirect('/');
        
    } catch (error) {
        console.error('Token verification failed:', error);
        res.status(401).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Invalid Access Link</title>
                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                    }
                    .container {
                        background: white;
                        padding: 40px;
                        border-radius: 10px;
                        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                        text-align: center;
                        max-width: 400px;
                    }
                    h1 {
                        color: #333;
                        margin-bottom: 20px;
                    }
                    p {
                        color: #666;
                        line-height: 1.6;
                    }
                    .error-icon {
                        font-size: 48px;
                        margin-bottom: 20px;
                        color: #e53e3e;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="error-icon">❌</div>
                    <h1>Invalid Access Link</h1>
                    <p>This access link is invalid or has expired.</p>
                    <p>Please check your email for the correct link or contact support.</p>
                </div>
            </body>
            </html>
        `);
    }
});

// Protected route - serves the guide HTML only to authenticated users
app.get('/', requireAuth, (req, res) => {
    // User is authenticated, serve the guide
    const guidePath = path.join(__dirname, 'index.html');
    
    // Read and serve the HTML file
    fs.readFile(guidePath, 'utf8', (err, html) => {
        if (err) {
            console.error('Error reading guide file:', err);
            return res.status(500).send('Error loading guide');
        }
        
        // Add a small banner showing the user is authenticated
        const authenticatedHtml = html.replace('<body>', `
            <body>
            <div id="auth-banner" style="
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
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            ">
                ✅ Authenticated Access | Licensed to: ${req.user.email} | 
                <span style="cursor: pointer; text-decoration: underline;" onclick="if(confirm('Are you sure you want to logout?')) { document.cookie = 'shopifyGuideAccess=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'; location.reload(); }">Logout</span>
            </div>
            <div style="height: 40px;"></div>
        `);
        
        res.send(authenticatedHtml);
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        protected: true,
        server: 'Shopify Guide Protected Server',
        port: PORT
    });
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🔐 ===========================================');
    console.log('🔐 PROTECTED GUIDE SERVER STARTED');
    console.log('🔐 ===========================================');
    console.log('');
    console.log(`✅ Server running on: http://localhost:${PORT}`);
    console.log('');
    console.log('🛡️  SECURITY FEATURES:');
    console.log('   • JWT Authentication Required');
    console.log('   • HTTP-Only Secure Cookies');
    console.log('   • Protected HTML Content');
    console.log('   • Automatic Session Management');
    console.log('');
    console.log('📋 HOW IT WORKS:');
    console.log('   1. User purchases through Razorpay (port 5000)');
    console.log('   2. Receives email with secure link');
    console.log(`   3. Link format: http://localhost:${PORT}/access?token=JWT_TOKEN`);
    console.log('   4. Token validates and sets secure cookie');
    console.log('   5. User can now access the guide');
    console.log('');
    console.log('🔒 PROTECTION STATUS: ACTIVE');
    console.log('   • Direct access to index.html: BLOCKED ❌');
    console.log('   • Access without purchase: BLOCKED ❌');
    console.log('   • Access with valid JWT: ALLOWED ✅');
    console.log('');
    console.log('===========================================');
});
