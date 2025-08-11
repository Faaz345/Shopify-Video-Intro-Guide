require('dotenv').config(); // Load environment variables
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const path = require('path');
const nodemailer = require('nodemailer');
const fs = require('fs');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin credentials - CHANGE THESE!
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'shopify2024!'
};

// Session configuration
app.use(session({
    secret: 'shopify-video-intro-admin-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Enable CORS for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Razorpay configuration - REPLACE WITH YOUR ACTUAL KEYS
const razorpay = new Razorpay({
    key_id: 'rzp_test_svuJcv020PyvU9', // Replace with your actual key
    key_secret: 's5ffeTjwaDB0MSbBm6yZvjoN' // Replace with your actual secret
});

// Email configuration for sending course content
// Multiple email service configurations for reliability
const emailConfigs = {
    // Primary: Gmail with App Password
    gmail: {
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER || 'code.commerce999@gmail.com',
            pass: process.env.GMAIL_APP_PASSWORD // Use Gmail App Password (from .env)
        }
    },
    // Backup: SendGrid SMTP
    sendgrid: {
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY || 'your-sendgrid-api-key'
        }
    },
    // Backup: Ethereal Email (for testing)
    ethereal: {
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
            user: process.env.ETHEREAL_USER || 'ethereal.user@ethereal.email',
            pass: process.env.ETHEREAL_PASS || 'ethereal-password'
        }
    },
    // Local development SMTP (MailHog)
    local: {
        host: 'localhost',
        port: 1025,
        secure: false,
        ignoreTLS: true
    }
};

// Initialize transporter with fallback logic
let transporter;
let currentEmailService = 'none';

async function initializeEmailTransporter() {
    // Try Gmail first (if credentials are provided)
    try {
        if (process.env.GMAIL_APP_PASSWORD && process.env.GMAIL_APP_PASSWORD !== 'your_app_password_here') {
            transporter = nodemailer.createTransport(emailConfigs.gmail);
            await transporter.verify();
            currentEmailService = 'gmail';
            console.log('✅ Email service initialized: Gmail');
            console.log(`📧 Using Gmail account: ${process.env.GMAIL_USER}`);
            return;
        } else {
            console.log('ℹ️ Gmail: No App Password configured (set GMAIL_APP_PASSWORD in .env file)');
            console.log('📋 To setup Gmail:');
            console.log('   1. Go to https://myaccount.google.com/security');
            console.log('   2. Enable 2-Step Verification');
            console.log('   3. Generate an App Password');
            console.log('   4. Add GMAIL_APP_PASSWORD=your_app_password to .env file');
        }
    } catch (error) {
        console.log('⚠️ Gmail configuration failed:', error.message);
        if (error.code === 'EAUTH') {
            console.log('🔧 Authentication failed - check your App Password in .env file');
        }
    }
    
    // Try SendGrid (if API key is provided)
    try {
        if (process.env.SENDGRID_API_KEY && process.env.SENDGRID_API_KEY !== 'your-sendgrid-api-key') {
            transporter = nodemailer.createTransport(emailConfigs.sendgrid);
            await transporter.verify();
            currentEmailService = 'sendgrid';
            console.log('✅ Email service initialized: SendGrid');
            return;
        } else {
            console.log('ℹ️ SendGrid: No API key provided (set SENDGRID_API_KEY environment variable)');
        }
    } catch (error) {
        console.log('⚠️ SendGrid configuration failed:', error.message);
    }
    
    // Try to create an Ethereal test account dynamically
    try {
        console.log('🔄 Creating Ethereal test account...');
        const testAccount = await nodemailer.createTestAccount();
        
        const etherealConfig = {
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        };
        
        transporter = nodemailer.createTransport(etherealConfig);
        await transporter.verify();
        currentEmailService = 'ethereal';
        
        console.log('✅ Email service initialized: Ethereal (test account)');
        console.log(`📧 Test account: ${testAccount.user}`);
        console.log('📋 Note: Emails will be captured for testing - check console for preview URLs');
        return;
        
    } catch (error) {
        console.log('⚠️ Ethereal test account creation failed:', error.message);
    }
    
    // Try manual Ethereal with provided credentials
    try {
        if (process.env.ETHEREAL_USER && process.env.ETHEREAL_PASS) {
            transporter = nodemailer.createTransport(emailConfigs.ethereal);
            await transporter.verify();
            currentEmailService = 'ethereal';
            console.log('✅ Email service initialized: Ethereal (manual credentials)');
            return;
        }
    } catch (error) {
        console.log('⚠️ Ethereal manual configuration failed:', error.message);
    }
    
    // Skip local SMTP as it requires external setup
    console.log('ℹ️ Local SMTP: Skipped (requires MailHog or similar service running on port 1025)');
    
    // No email service available
    console.log('❌ No email service could be initialized. Course delivery will be manual.');
    console.log('💡 To enable email delivery:');
    console.log('   - Set GMAIL_APP_PASSWORD for Gmail');
    console.log('   - Set SENDGRID_API_KEY for SendGrid');
    console.log('   - Or install MailHog for local testing');
    currentEmailService = 'none';
}

// Course content data - Shopify Video Intro Guide (Dynamic pricing system)
let courseContent = {
    title: 'Shopify Video Intro Guide - Liquid Programming Tutorial',
    description: 'Master advanced Liquid templating to add cinematic video intros to Shopify stores',
    price: 599, // INR - This will be dynamically updated
    files: [
        {
            name: 'video-intro.liquid',
            description: 'Complete Liquid snippet for video intro functionality',
            content: `{% comment %} Shopify Video Intro Component {% endcomment %}
{% if settings.intro_desktop_video != blank %}
<div id="shopi_video_intro">
  <div id="just-black"></div>
  {% if settings.intro_skip != blank %}
    <button type="button" class="skip-button" onclick="skipVideoIntro()" aria-label="{{ settings.intro_skip }}">{{ settings.intro_skip }}</button>
  {% endif %}
  <div class="vi-intro-window">
    <audio id="enter-sound">
      <source src="{{ settings.intro_audio_file }}">
    </audio>
    <div id="package3" class="vi-animation-container vi-animation">
      <video style='opacity:0;' class="vi-desktop-only vid" id="animation-desktop" muted="" playsinline="" webkit-playsinline="" onended="removeIntroWindow()" preload="auto">
        <source src="{{ settings.intro_desktop_video }}">
      </video>
      <video style='opacity:0;' class="vi-mobile-only vid" id="animation-mobile" muted="" playsinline="" webkit-playsinline="" onended="removeIntroWindow()" preload="auto">
        <source src="{{ settings.intro_mobile_video }}">
      </video>
    </div>
  </div>
</div>

<style>
/* Video Intro Styles */
#just-black {
  position: absolute;
  background: black;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9998;
}

.vi-desktop-only {
  display: block;
}

.vi-mobile-only {
  display: none;
}

.vi-intro-window {
  display: none;
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 9999;
}

.vi-intro-window.show {
  display: block;
}

.vi-intro-window.fade-out {
  opacity: 0;
  transition: opacity .5s linear;
}

body.vi-video-active {
  overflow: hidden;
}

.vi-animation-container {
  width: 100%;
  height: 100%;
  z-index: 80;
}

.vi-animation-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.skip-button {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  color: {{ settings.skip_color | default: '#ffffff' }};
  border: 1px solid {{ settings.skip_color | default: '#ffffff' }};
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  z-index: 10001;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

.skip-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

@media (max-width: 768px) {
  .vi-desktop-only {
    display: none !important;
  }
  .vi-mobile-only {
    display: block;
  }
  .skip-button {
    top: 12px;
    right: 12px;
    padding: 6px 12px;
    font-size: 13px;
  }
}
</style>

<script>
// Video Intro JavaScript
const justBlack = document.querySelector("#just-black");
const enterSound = document.querySelector("#enter-sound");
const introWindow = document.querySelector(".vi-intro-window");
const animationVideoContainer = document.querySelector(".vi-animation");
const animationVideo = document.querySelectorAll(".vi-animation video");
const skipButton = document.querySelector(".skip-button");
const volumeIntro = {{ settings.volume_intro }};

let videoEnded = false;
let videosLoaded = false;

function checkConnectionSpeed() {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    if (connection.effectiveType === '3g' ||
        connection.effectiveType === '2g' ||
        connection.downlink < 10) {
      sessionStorage.setItem("videoPlayed", true);
      return true;
    }
    return false;
  } else {
    return false;
  }
}

function preloadVideos() {
  const videos = document.querySelectorAll('.vid');
  let loadedCount = 0;
  videos.forEach(video => {
    video.addEventListener('loadeddata', () => {
      loadedCount++;
      if (loadedCount === videos.length) {
        videosLoaded = true;
      }
    });
    video.addEventListener('error', () => {
      removeIntroWindow();
    });
    video.load();
  });
}

function initializeVideoIntro() {
  if (sessionStorage.getItem("videoPlayed"))
    return;
  if (!checkConnectionSpeed()) {
    justBlack.style.display = 'block';
    const videoLoadTimeout = setTimeout(() => {
      removeIntroWindow();
    }, 30000);
    requestAnimationFrame(() => {
      introWindow.style.display = 'block';
      introWindow.classList.add('show');
      document.querySelectorAll('.vid').forEach(vid => {
        vid.style.opacity = '1';
        vid.addEventListener('error', () => {
          clearTimeout(videoLoadTimeout);
          removeIntroWindow();
        });
      });
      document.body.classList.add('vi-video-active');
    });
  } else {
    sessionStorage.setItem("videoPlayed", true);
  }
}

function removeIntroWindow() {
  introWindow.classList.add("fade-out");
  sessionStorage.setItem("videoPlayed", true);
  document.body.classList.remove('vi-video-active');
  justBlack.style.display = "none";
  videoEnded = true;
}

function skipVideoIntro() {
  animationVideo.forEach(vid => {
    vid.pause();
    vid.currentTime = 0;
  });
  if (enterSound) {
    enterSound.pause();
    enterSound.currentTime = 0;
  }
  removeIntroWindow();
  sessionStorage.setItem("videoPlayed", true);
}

// Initialize
setTimeout(() => {
  preloadVideos();
  initializeVideoIntro();
}, 0);

animationVideoContainer.addEventListener("click", () => {
  if (checkConnectionSpeed() || videoEnded) return;
  if (!videosLoaded) return;
  animationVideo.forEach((vid => {
    vid.play();
  }));
  enterSound.volume = volumeIntro / 100;
  enterSound.play();
});

document.querySelectorAll('.vid').forEach(video => {
  video.addEventListener('ended', () => {
    introWindow.classList.add('fade-out');
    justBlack.style.display = "none";
    videoEnded = true;
    setTimeout(() => {
      introWindow.style.display = 'none';
      sessionStorage.setItem('videoPlayed', true);
    }, 1000);
  });
});
</script>

{% else %}
  <!-- Video intro requires at least the desktop intro video -->
{% endif %}`
        },
        {
            name: 'settings_schema.json',
            description: 'Theme settings configuration for video intro customization',
            content: `{
  "name": "Video intro",
  "settings": [
    {
      "type": "url",
      "id": "intro_audio_file",
      "label": "Background Audio"
    },
    {
      "type": "url",
      "id": "intro_desktop_video",
      "label": "Desktop Video"
    },
    {
      "type": "url",
      "id": "intro_mobile_video",
      "label": "Mobile Video"
    },
    {
      "type": "range",
      "id": "volume_intro",
      "min": 0,
      "max": 100,
      "step": 1,
      "unit": "%",
      "label": "Audio Volume",
      "default": 20
    },
    {
      "type": "header",
      "content": "Video Intro Settings"
    },
    {
      "type": "text",
      "id": "intro_skip",
      "label": "Skip Button Text",
      "default": "Skip Intro",
      "info": "Leave blank to hide the skip button"
    },
    {
      "type": "color",
      "id": "skip_color",
      "label": "Skip Button Color",
      "default": "#ffffff",
      "info": "Color for the skip button text and border"
    }
  ]
}`
        },
        {
            name: 'theme-integration.liquid',
            description: 'Code to add to theme.liquid file',
            content: '{% render \'video-intro\' %}'
        },
        {
            name: 'Implementation-Guide.md',
            description: 'Complete step-by-step implementation guide',
            content: `# Shopify Video Intro Implementation Guide

## Overview
This guide teaches you to add a cinematic video intro to any Shopify store using custom Liquid code.

## Prerequisites
- Shopify Admin access
- A short MP4 video for desktop and mobile
- (Optional) MP3 audio file
- Basic HTML/CSS knowledge helpful but not required

## Step-by-Step Implementation

### Step 1: Open Shopify Code Editor
1. Go to your Shopify Admin: \`https://admin.shopify.com/store/your-store-handle\`
2. Navigate to **Online Store > Themes**
3. Click the **3-dot menu > Edit code**

### Step 2: Add the Liquid Snippet
1. In the code editor, scroll to **Snippets**
2. Click **Add new snippet**
3. Name it \`video-intro\`
4. Paste the provided \`video-intro.liquid\` code
5. Click **Save**

### Step 3: Update Theme Settings Schema
1. Open \`config/settings_schema.json\`
2. Find the closing bracket before the last \`]\`
3. Add a comma after the previous section
4. Paste the provided settings schema code
5. Click **Save**

### Step 4: Embed in Theme Layout
1. Open \`layout/theme.liquid\`
2. Find the line: \`<link rel="canonical" href="{{ canonical_url }}">\`
3. Add this line directly below it: \`{% render 'video-intro' %}\`
4. Click **Save**

### Step 5: Configure Settings
1. Go to **Online Store > Themes**
2. Click **Customize** on your live theme
3. In the theme settings, find **Video intro** section
4. Upload your video files and configure settings:
   - **Desktop Video**: Upload MP4 for desktop viewing
   - **Mobile Video**: Upload MP4 optimized for mobile
   - **Background Audio**: Upload MP3 (optional)
   - **Audio Volume**: Set volume percentage
   - **Skip Button Text**: Customize or leave blank to hide
   - **Skip Button Color**: Choose color for skip button

### Step 6: Test and Preview
1. Save your theme settings
2. Preview your store
3. The video intro should appear on first visit
4. Test skip functionality and mobile responsiveness

## Advanced Customization

### Connection Speed Detection
The code automatically detects slow connections and skips the video intro to improve user experience.

### Session Storage
Uses browser session storage to ensure the intro only plays once per session.

### Mobile Optimization
- Separate video files for mobile devices
- Responsive design adjustments
- Touch-friendly skip button

### Performance Features
- Video preloading with error handling
- Timeout protection (30 seconds)
- Memory cleanup after playback

## Troubleshooting

### Video Not Playing
- Ensure MP4 format and proper encoding
- Check file size (recommended < 10MB)
- Verify file URLs are accessible

### Skip Button Not Appearing
- Check that \`Skip Button Text\` is not empty
- Verify CSS is not conflicting

### Mobile Issues
- Ensure mobile video is properly uploaded
- Test on actual mobile devices
- Check video compression and format

## Technical Details

### Browser Compatibility
- Chrome, Firefox, Safari, Edge (latest versions)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Fallback for unsupported browsers

### File Structure
\`\`\`
snippets/
  └── video-intro.liquid
config/
  └── settings_schema.json (modified)
layout/
  └── theme.liquid (modified)
\`\`\`

### Key Functions
- \`checkConnectionSpeed()\`: Detects slow connections
- \`preloadVideos()\`: Handles video preloading
- \`skipVideoIntro()\`: Skip functionality
- \`removeIntroWindow()\`: Cleanup and removal

## Support
For implementation questions or customization help:
- Email: code.commerce999@gmail.com
- Response time: Within 24 hours

## Best Practices
1. Keep videos under 10MB for best performance
2. Use landscape orientation for desktop videos
3. Test on multiple devices and connections
4. Consider accessibility with skip button
5. Monitor Core Web Vitals impact

Created with ❤️ by Code & Commerce`
        }
    ]
};

// In-memory storage for orders (use database in production)
const pendingOrders = new Map();

// Admin authentication middleware
function requireAuth(req, res, next) {
    if (req.session && req.session.isAdmin) {
        return next();
    } else {
        return res.status(401).json({ success: false, error: 'Authentication required' });
    }
}

// Routes

// Home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Admin login endpoint
app.post('/api/admin/login', (req, res) => {
    const { username, password } = req.body;
    
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        req.session.isAdmin = true;
        req.session.loginTime = new Date();
        
        res.json({
            success: true,
            message: 'Login successful',
            redirectUrl: '/admin/dashboard'
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});

// Admin logout endpoint
app.post('/api/admin/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

// Admin dashboard
app.get('/admin/dashboard', requireAuth, (req, res) => {
    const adminDashboardHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Dashboard - Shopify Video Intro Guide</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                color: white;
                min-height: 100vh;
                padding: 20px;
            }
            .header {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 30px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .header h1 {
                color: #00f5ff;
                font-size: 1.8rem;
            }
            .logout-btn {
                background: linear-gradient(135deg, #ff4444, #cc0000);
                color: white;
                border: none;
                padding: 10px 20px;
                border-radius: 8px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            .logout-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(255, 68, 68, 0.3);
            }
            .dashboard-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }
            .card {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
                transition: all 0.3s ease;
            }
            .card:hover {
                transform: translateY(-5px);
                box-shadow: 0 15px 35px rgba(0, 245, 255, 0.1);
            }
            .card h3 {
                color: #00f5ff;
                margin-bottom: 15px;
                font-size: 1.3rem;
            }
            .stat {
                font-size: 2rem;
                font-weight: 700;
                color: #00ff88;
                margin-bottom: 10px;
            }
            .link-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }
            .admin-link {
                background: rgba(0, 245, 255, 0.1);
                border: 1px solid rgba(0, 245, 255, 0.3);
                border-radius: 10px;
                padding: 15px 20px;
                text-decoration: none;
                color: #00f5ff;
                transition: all 0.3s ease;
                display: block;
                text-align: center;
                font-weight: 600;
            }
            .admin-link:hover {
                background: rgba(0, 245, 255, 0.2);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(0, 245, 255, 0.2);
            }
            .system-info {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 10px;
                padding: 15px;
                margin-top: 20px;
                font-family: 'Courier New', monospace;
                font-size: 14px;
                color: #b0b0b0;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔐 Admin Dashboard</h1>
            <button class="logout-btn" onclick="logout()">Logout</button>
        </div>
        
        <div class="dashboard-grid">
            <div class="card">
                <h3>📊 System Status</h3>
                <div class="stat">🟢 ONLINE</div>
                <p>Server running smoothly</p>
                <div class="system-info">
                    Login Time: ${new Date(req.session.loginTime).toLocaleString()}<br>
                    Session ID: ${req.session.id.substring(0, 8)}...
                </div>
            </div>
            
            <div class="card">
                <h3>💰 Guide Sales</h3>
                <div class="stat">₹${courseContent.price}</div>
                <p>Price per guide</p>
            </div>
            
            <div class="card">
                <h3>📧 Email System</h3>
                <div class="stat">📤</div>
                <p>Nodemailer configured</p>
            </div>
        </div>
        
        <div class="card">
            <h3>🔗 Quick Access Links</h3>
            <div class="link-grid">
                <a href="/" class="admin-link" target="_blank">🏠 Main Website</a>
                <a href="/success.html" class="admin-link" target="_blank">✅ Success Page</a>
                <a href="/test-frontend.html" class="admin-link" target="_blank">🧪 Test Interface</a>
                <a href="/admin/orders" class="admin-link">📋 Order Management</a>
                <a href="/admin/pricing" class="admin-link">💰 Price Management</a>
                <a href="/admin/settings" class="admin-link">⚙️ System Settings</a>
                <a href="/admin/logs" class="admin-link">📊 System Logs</a>
            </div>
        </div>
        
        <div class="card">
            <h3>⚙️ Configuration</h3>
            <div class="system-info">
                <strong>Razorpay:</strong> Configured (Key: ${razorpay.key_id})<br>
                <strong>Email:</strong> code.commerce999@gmail.com<br>
                <strong>Port:</strong> ${PORT}<br>
                <strong>Node.js:</strong> ${process.version}<br>
                <strong>Uptime:</strong> ${Math.floor(process.uptime())} seconds
            </div>
        </div>
        
        <script>
            async function logout() {
                try {
                    const response = await fetch('/api/admin/logout', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        window.location.href = '/';
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                    window.location.href = '/';
                }
            }
        </script>
    </body>
    </html>
    `;
    
    res.send(adminDashboardHTML);
});

// Admin orders page
app.get('/admin/orders', requireAuth, (req, res) => {
    const ordersHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Orders - Admin Dashboard</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                color: white;
                margin: 0;
                padding: 20px;
            }
            .header {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .back-btn {
                background: linear-gradient(135deg, #00f5ff, #0066ff);
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
            }
            .orders-container {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📋 Order Management</h1>
            <a href="/admin/dashboard" class="back-btn">← Back to Dashboard</a>
        </div>
        
        <div class="orders-container">
            <h3>Recent Orders</h3>
            <p>Current pending orders: ${pendingOrders.size}</p>
            <div id="orders-list">
                ${Array.from(pendingOrders.entries()).map(([id, order]) => `
                    <div style="background: rgba(0,0,0,0.3); padding: 15px; margin: 10px 0; border-radius: 8px;">
                        <strong>Order ID:</strong> ${order.orderId}<br>
                        <strong>Amount:</strong> ₹${order.amount / 100}<br>
                        <strong>Created:</strong> ${order.created.toLocaleString()}
                    </div>
                `).join('')}
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(ordersHTML);
});

// Admin settings page
app.get('/admin/settings', requireAuth, (req, res) => {
    const settingsHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Settings - Admin Dashboard</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                color: white;
                margin: 0;
                padding: 20px;
            }
            .header {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .back-btn {
                background: linear-gradient(135deg, #00f5ff, #0066ff);
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
            }
            .settings-container {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .setting-item {
                background: rgba(0, 0, 0, 0.3);
                padding: 20px;
                margin: 15px 0;
                border-radius: 10px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>⚙️ System Settings</h1>
            <a href="/admin/dashboard" class="back-btn">← Back to Dashboard</a>
        </div>
        
        <div class="settings-container">
            <div class="setting-item">
                <h3>🔑 Authentication</h3>
                <p>Username: ${ADMIN_CREDENTIALS.username}</p>
                <p>Password: ********</p>
            </div>
            
            <div class="setting-item">
                <h3>💳 Razorpay Configuration</h3>
                <p>Key ID: ${razorpay.key_id}</p>
                <p>Secret: ********</p>
            </div>
            
            <div class="setting-item">
                <h3>📧 Email Configuration</h3>
                <p>From: code.commerce999@gmail.com</p>
                <p>Service: Gmail</p>
            </div>
            
            <div class="setting-item">
                <h3>💰 Guide Settings</h3>
                <p>Price: ₹${courseContent.price}</p>
                <p>Title: ${courseContent.title}</p>
            </div>
        </div>
    </body>
    </html>
    `;
    
    res.send(settingsHTML);
});

// Get current price (for frontend to fetch dynamically)
app.get('/api/course/price', (req, res) => {
    res.json({
        success: true,
        price: courseContent.price,
        currency: 'INR',
        title: courseContent.title
    });
});

// Update course price (admin only)
app.post('/api/admin/update-price', requireAuth, (req, res) => {
    try {
        const { newPrice } = req.body;
        
        // Validate price
        if (!newPrice || isNaN(newPrice) || newPrice <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid price. Price must be a positive number.'
            });
        }
        
        if (newPrice > 50000) {
            return res.status(400).json({
                success: false,
                error: 'Price too high. Maximum allowed price is ₹50,000.'
            });
        }
        
        // Update the price
        const oldPrice = courseContent.price;
        courseContent.price = parseInt(newPrice);
        
        console.log(`Price updated from ₹${oldPrice} to ₹${newPrice} by admin`);
        
        res.json({
            success: true,
            message: `Price updated successfully from ₹${oldPrice} to ₹${newPrice}`,
            oldPrice: oldPrice,
            newPrice: courseContent.price
        });
        
    } catch (error) {
        console.error('Price update error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update price'
        });
    }
});

// Admin price management page
app.get('/admin/pricing', requireAuth, (req, res) => {
    const pricingHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Price Management - Admin Dashboard</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                color: white;
                margin: 0;
                padding: 20px;
            }
            .header {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .back-btn {
                background: linear-gradient(135deg, #00f5ff, #0066ff);
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
            }
            .pricing-container {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                max-width: 800px;
                margin: 0 auto;
            }
            .current-price-card {
                background: rgba(0, 245, 255, 0.1);
                border: 2px solid rgba(0, 245, 255, 0.3);
                border-radius: 15px;
                padding: 30px;
                text-align: center;
                margin-bottom: 30px;
            }
            .current-price {
                font-size: 4rem;
                font-weight: 900;
                color: #00f5ff;
                margin: 20px 0;
            }
            .price-form {
                background: rgba(0, 0, 0, 0.3);
                border-radius: 15px;
                padding: 30px;
                margin-bottom: 20px;
            }
            .form-group {
                margin-bottom: 20px;
            }
            .form-label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #00f5ff;
            }
            .form-input {
                width: 100%;
                background: rgba(255, 255, 255, 0.1);
                border: 1px solid rgba(255, 255, 255, 0.3);
                border-radius: 10px;
                padding: 15px;
                color: white;
                font-size: 1.2rem;
                font-weight: 600;
                text-align: center;
            }
            .form-input:focus {
                outline: none;
                border-color: #00f5ff;
                background: rgba(0, 245, 255, 0.1);
            }
            .update-btn {
                width: 100%;
                background: linear-gradient(135deg, #00ff88, #00cc6a);
                color: white;
                border: none;
                border-radius: 10px;
                padding: 15px;
                font-size: 1.1rem;
                font-weight: 700;
                cursor: pointer;
                transition: all 0.3s ease;
                margin-top: 10px;
            }
            .update-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 30px rgba(0, 255, 136, 0.3);
            }
            .update-btn:disabled {
                background: #666;
                cursor: not-allowed;
            }
            .price-info {
                background: rgba(255, 170, 0, 0.1);
                border: 1px solid rgba(255, 170, 0, 0.3);
                border-radius: 10px;
                padding: 20px;
                margin-top: 20px;
            }
            .alert {
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                font-weight: 600;
                display: none;
            }
            .alert.success {
                background: rgba(0, 255, 136, 0.2);
                color: #00ff88;
                border: 1px solid rgba(0, 255, 136, 0.5);
            }
            .alert.error {
                background: rgba(255, 107, 107, 0.2);
                color: #ff6b6b;
                border: 1px solid rgba(255, 107, 107, 0.5);
            }
            .quick-prices {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 10px;
                margin-top: 20px;
            }
            .quick-price-btn {
                background: rgba(0, 102, 255, 0.1);
                border: 1px solid rgba(0, 102, 255, 0.3);
                color: #0066ff;
                border-radius: 8px;
                padding: 10px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s ease;
            }
            .quick-price-btn:hover {
                background: rgba(0, 102, 255, 0.2);
                transform: translateY(-1px);
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>💰 Price Management</h1>
            <a href="/admin/dashboard" class="back-btn">← Back to Dashboard</a>
        </div>
        
        <div class="pricing-container">
            <div class="current-price-card">
                <h3>Current Course Price</h3>
                <div class="current-price" id="currentPrice">₹${courseContent.price}</div>
                <p>Shopify Video Intro Guide - Liquid Programming Tutorial</p>
            </div>
            
            <div class="price-form">
                <h3>Update Course Price</h3>
                
                <div class="alert" id="alertMessage"></div>
                
                <form id="priceUpdateForm">
                    <div class="form-group">
                        <label class="form-label" for="newPrice">New Price (₹ INR)</label>
                        <input type="number" id="newPrice" class="form-input" min="1" max="50000" step="1" placeholder="Enter new price">
                    </div>
                    
                    <button type="submit" class="update-btn" id="updateBtn">
                        <i class="fas fa-rupee-sign" style="margin-right: 8px;"></i>
                        Update Price
                    </button>
                </form>
                
                <div class="quick-prices">
                    <button class="quick-price-btn" onclick="setQuickPrice(299)">₹299</button>
                    <button class="quick-price-btn" onclick="setQuickPrice(499)">₹499</button>
                    <button class="quick-price-btn" onclick="setQuickPrice(599)">₹599</button>
                    <button class="quick-price-btn" onclick="setQuickPrice(799)">₹799</button>
                    <button class="quick-price-btn" onclick="setQuickPrice(999)">₹999</button>
                    <button class="quick-price-btn" onclick="setQuickPrice(1299)">₹1,299</button>
                </div>
            </div>
            
            <div class="price-info">
                <h4>💡 Price Update Information</h4>
                <ul style="margin: 15px 0; padding-left: 20px;">
                    <li>Price changes take effect immediately on the website</li>
                    <li>All new Razorpay orders will use the updated price</li>
                    <li>Existing pending orders are not affected</li>
                    <li>Price range: ₹1 - ₹50,000</li>
                    <li>Changes are logged for admin tracking</li>
                </ul>
            </div>
        </div>
        
        <script>
            const form = document.getElementById('priceUpdateForm');
            const newPriceInput = document.getElementById('newPrice');
            const updateBtn = document.getElementById('updateBtn');
            const currentPriceDisplay = document.getElementById('currentPrice');
            const alertMessage = document.getElementById('alertMessage');
            
            function showAlert(message, type = 'success') {
                alertMessage.textContent = message;
                alertMessage.className = \`alert \${type}\`;
                alertMessage.style.display = 'block';
                
                setTimeout(() => {
                    alertMessage.style.display = 'none';
                }, 5000);
            }
            
            function setQuickPrice(price) {
                newPriceInput.value = price;
            }
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const newPrice = parseInt(newPriceInput.value);
                
                if (!newPrice || newPrice <= 0) {
                    showAlert('Please enter a valid price greater than 0', 'error');
                    return;
                }
                
                if (newPrice > 50000) {
                    showAlert('Maximum allowed price is ₹50,000', 'error');
                    return;
                }
                
                updateBtn.disabled = true;
                updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right: 8px;"></i>Updating...';
                
                try {
                    const response = await fetch('/api/admin/update-price', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ newPrice })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        currentPriceDisplay.textContent = \`₹\${data.newPrice}\`;
                        newPriceInput.value = '';
                        showAlert(data.message, 'success');
                    } else {
                        showAlert(data.error || 'Failed to update price', 'error');
                    }
                    
                } catch (error) {
                    console.error('Price update error:', error);
                    showAlert('Network error. Please try again.', 'error');
                } finally {
                    updateBtn.disabled = false;
                    updateBtn.innerHTML = '<i class="fas fa-rupee-sign" style="margin-right: 8px;"></i>Update Price';
                }
            });
            
            // Auto-format number input
            newPriceInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length > 5) {
                    value = value.substring(0, 5);
                }
                e.target.value = value;
            });
        </script>
        
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </body>
    </html>
    `;
    
    res.send(pricingHTML);
});

// Admin logs page
app.get('/admin/logs', requireAuth, (req, res) => {
    const logsHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Logs - Admin Dashboard</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
                color: white;
                margin: 0;
                padding: 20px;
            }
            .header {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 20px;
                margin-bottom: 30px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .back-btn {
                background: linear-gradient(135deg, #00f5ff, #0066ff);
                color: white;
                text-decoration: none;
                padding: 10px 20px;
                border-radius: 8px;
                font-weight: 600;
            }
            .logs-container {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 25px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                font-family: 'Courier New', monospace;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>📊 System Logs</h1>
            <a href="/admin/dashboard" class="back-btn">← Back to Dashboard</a>
        </div>
        
        <div class="logs-container">
            <h3>Server Information</h3>
            <p>Server started: ${new Date().toISOString()}</p>
            <p>Node.js version: ${process.version}</p>
            <p>Platform: ${process.platform}</p>
            <p>Memory usage: ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB</p>
            <p>Uptime: ${Math.floor(process.uptime())} seconds</p>
            
            <h3>Recent Activity</h3>
            <p>Admin login: ${new Date(req.session.loginTime).toISOString()}</p>
            <p>Pending orders: ${pendingOrders.size}</p>
        </div>
    </body>
    </html>
    `;
    
    res.send(logsHTML);
});

// Create Razorpay order with full UPI support
app.post('/api/create-order', async (req, res) => {
    try {
        const options = {
            amount: courseContent.price * 100, // Amount in paise (₹599)
            currency: 'INR',
            receipt: `shopify_guide_${Date.now()}`,
            notes: {
                course: 'Shopify Video Intro Guide',
                description: 'Liquid Programming Tutorial'
            }
        };

        const order = await razorpay.orders.create(options);
        
        // Store order temporarily
        pendingOrders.set(order.id, {
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            created: new Date()
        });

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

// Verify payment and deliver content
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

        // Verify order exists
        const orderData = pendingOrders.get(razorpay_order_id);
        if (!orderData) {
            return res.status(400).json({
                success: false,
                error: 'Order not found'
            });
        }

        // Payment verified successfully
        console.log('Payment verified:', {
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id,
            email: customer_email
        });

        // Send secure course access via email
        try {
            await sendCourseAccess(customer_email, {
                payment_id: razorpay_payment_id,
                order_id: razorpay_order_id
            });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            // Don't fail the payment verification if email fails
        }

        // Clean up
        pendingOrders.delete(razorpay_order_id);

        res.json({
            success: true,
            message: 'Payment verified successfully! Course content has been sent to your email.',
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

// Success page
app.get('/success.html', (req, res) => {
    const successHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Successful - Shopify Video Intro Guide</title>
        <style>
            body {
                font-family: 'Inter', sans-serif;
                background: linear-gradient(135deg, #050505 0%, #0a0a0a 100%);
                color: white;
                margin: 0;
                padding: 0;
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .success-container {
                text-align: center;
                max-width: 600px;
                padding: 3rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(20px);
            }
            .success-icon {
                font-size: 4rem;
                color: #00ff88;
                margin-bottom: 2rem;
            }
            h1 {
                font-size: 2.5rem;
                margin-bottom: 1rem;
                color: #00f5ff;
            }
            p {
                font-size: 1.2rem;
                margin-bottom: 2rem;
                color: #b0b0b0;
            }
            .course-info {
                background: rgba(0, 0, 0, 0.3);
                padding: 2rem;
                border-radius: 15px;
                margin: 2rem 0;
            }
            .home-button {
                display: inline-block;
                background: linear-gradient(135deg, #00f5ff, #0066ff);
                color: white;
                padding: 1rem 2rem;
                border-radius: 10px;
                text-decoration: none;
                font-weight: 600;
                margin-top: 2rem;
                transition: transform 0.3s ease;
            }
            .home-button:hover {
                transform: translateY(-2px);
            }
        </style>
    </head>
    <body>
        <div class="success-container">
            <div class="success-icon">✅</div>
            <h1>Payment Successful!</h1>
            <p>Thank you for purchasing the Shopify Video Intro Guide!</p>
            
            <div class="course-info">
                <h3>📧 Check Your Email</h3>
                <p>Your complete Liquid programming tutorial has been sent to your email address. This includes:</p>
                <ul style="text-align: left; margin: 1rem 0;">
                    <li>Complete <code>video-intro.liquid</code> snippet</li>
                    <li><code>settings_schema.json</code> configuration</li>
                    <li>Step-by-step implementation guide</li>
                    <li>Mobile optimization code</li>
                    <li>Performance optimization tips</li>
                </ul>
            </div>
            
            <p><strong>Need help?</strong><br>
            Email us at code.commerce999@gmail.com</p>
            
            <a href="/" class="home-button">← Back to Home</a>
        </div>
    </body>
    </html>
    `;
    
    res.send(successHTML);
});

// In-memory storage for secure access tokens (use database in production)
const secureAccessTokens = new Map();
const activeUserSessions = new Map(); // Track active user sessions
const deviceRestrictions = new Map(); // Track device restrictions

// Generate secure access token
function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex') + '_' + Date.now();
}

// Create secure guide access
function createCourseAccess(email, paymentDetails) {
    const accessToken = generateSecureToken();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365); // 1 year access
    
    const accessData = {
        token: accessToken,
        email: email,
        paymentId: paymentDetails.payment_id,
        orderId: paymentDetails.order_id,
        purchaseDate: new Date(),
        expiryDate: expiryDate,
        accessCount: 0,
        maxAccess: 50, // Limit to 50 access attempts to prevent sharing
        ipAddresses: [], // Track IP addresses
        lastAccessed: null,
        isActive: true
    };
    
    secureAccessTokens.set(accessToken, accessData);
    
    // Log the secure access creation
    console.log(`🔐 Secure guide access created for: ${email}`);
    console.log(`🎟️ Access token: ${accessToken.substring(0, 16)}...`);
    
    return {
        accessToken,
        courseUrl: `https://shopify-intro-guide.vercel.app/?token=${accessToken}&email=${encodeURIComponent(email)}`,
        expiryDate
    };
}

// Ultra-secure device fingerprinting with additional browser characteristics
function generateDeviceFingerprint(req) {
    const userAgent = req.get('User-Agent') || 'unknown';
    const acceptLanguage = req.get('Accept-Language') || 'unknown';
    const acceptEncoding = req.get('Accept-Encoding') || 'unknown';
    const accept = req.get('Accept') || 'unknown';
    const dnt = req.get('DNT') || 'unknown';
    const connection = req.get('Connection') || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const secFetchSite = req.get('Sec-Fetch-Site') || 'unknown';
    const secFetchMode = req.get('Sec-Fetch-Mode') || 'unknown';
    
    // Create a highly unique device fingerprint
    const fingerprint = crypto.createHash('sha256')
        .update(userAgent + acceptLanguage + acceptEncoding + accept + dnt + connection + ip + secFetchSite + secFetchMode)
        .digest('hex');
    
    return fingerprint;
}

// Generate unique tab/window identifier
function generateTabIdentifier() {
    return crypto.randomBytes(32).toString('hex');
}

// Advanced session management with single-tab enforcement
class SecureSessionManager {
    constructor() {
        this.activeSessions = new Map(); // token -> session data
        this.tabSessions = new Map(); // tabId -> session data
        this.deviceSessions = new Map(); // deviceFingerprint -> active tabs
    }
    
    createSession(token, email, deviceFingerprint, clientIP, userAgent) {
        const tabId = generateTabIdentifier();
        const sessionId = crypto.randomBytes(16).toString('hex');
        const now = new Date();
        
        const sessionData = {
            sessionId,
            tabId,
            token,
            email,
            deviceFingerprint,
            clientIP,
            userAgent,
            createdAt: now,
            lastActivity: now,
            isActive: true,
            heartbeatCount: 0,
            suspiciousActivity: 0
        };
        
        // Check if device already has an active session
        if (this.deviceSessions.has(deviceFingerprint)) {
            const existingTabs = this.deviceSessions.get(deviceFingerprint);
            // Invalidate all existing tabs for this device+token combination
            for (const existingTabId of existingTabs) {
                if (this.tabSessions.has(existingTabId)) {
                    const existingSession = this.tabSessions.get(existingTabId);
                    if (existingSession.token === token) {
                        existingSession.isActive = false;
                        console.log(`🚫 Invalidated existing session: ${existingTabId.substring(0, 16)}...`);
                    }
                }
            }
            existingTabs.clear();
            existingTabs.add(tabId);
        } else {
            this.deviceSessions.set(deviceFingerprint, new Set([tabId]));
        }
        
        this.activeSessions.set(token, sessionData);
        this.tabSessions.set(tabId, sessionData);
        
        console.log(`🔐 New secure session created: ${tabId.substring(0, 16)}... for ${email}`);
        return sessionData;
    }
    
    validateSession(token, tabId, deviceFingerprint, email) {
        const session = this.tabSessions.get(tabId);
        
        if (!session || !session.isActive) {
            return { valid: false, reason: 'session_not_found' };
        }
        
        if (session.token !== token) {
            return { valid: false, reason: 'token_mismatch' };
        }
        
        if (session.email !== email) {
            return { valid: false, reason: 'email_mismatch' };
        }
        
        if (session.deviceFingerprint !== deviceFingerprint) {
            session.suspiciousActivity++;
            if (session.suspiciousActivity > 3) {
                session.isActive = false;
                return { valid: false, reason: 'device_fingerprint_mismatch' };
            }
        }
        
        // Update last activity
        session.lastActivity = new Date();
        session.heartbeatCount++;
        
        return { valid: true, session };
    }
    
    invalidateSession(tabId) {
        const session = this.tabSessions.get(tabId);
        if (session) {
            session.isActive = false;
            console.log(`🚫 Session invalidated: ${tabId.substring(0, 16)}...`);
        }
    }
    
    cleanupExpiredSessions() {
        const now = new Date();
        const maxAge = 30 * 60 * 1000; // 30 minutes
        
        for (const [tabId, session] of this.tabSessions.entries()) {
            if (now - session.lastActivity > maxAge) {
                session.isActive = false;
                this.tabSessions.delete(tabId);
                console.log(`🗑️ Expired session cleaned up: ${tabId.substring(0, 16)}...`);
            }
        }
    }
}

const sessionManager = new SecureSessionManager();

// Cleanup expired sessions every 5 minutes
setInterval(() => {
    sessionManager.cleanupExpiredSessions();
}, 5 * 60 * 1000);

// Check for concurrent sessions
function checkConcurrentSessions(token, deviceFingerprint) {
    const existingSession = activeUserSessions.get(token);
    
    if (existingSession && existingSession.deviceFingerprint !== deviceFingerprint) {
        // Different device trying to access - suspicious activity
        return {
            allowed: false,
            reason: 'concurrent_session_detected'
        };
    }
    
    return { allowed: true };
}

// Ultra-secure access verification with single-tab enforcement
app.get('/api/verify-access/:token', (req, res) => {
    const { token } = req.params;
    const { email, tabId, isNewTab } = req.query;
    const clientIP = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';
    const referer = req.get('Referer') || 'direct';
    const deviceFingerprint = generateDeviceFingerprint(req);
    
    const accessData = secureAccessTokens.get(token);
    
    if (!accessData) {
        console.log(`❌ Invalid access token attempted: ${token.substring(0, 16)}...`);
        return res.status(404).json({
            success: false,
            error: 'Invalid access token. Please check your course access link.',
            action: 'redirect_to_email'
        });
    }
    
    // Check if token is expired
    if (new Date() > accessData.expiryDate) {
        return res.status(403).json({
            success: false,
            error: 'Access token has expired. Please contact support to renew your access.',
            action: 'redirect_to_email'
        });
    }
    
    // Check if email matches
    if (accessData.email !== email) {
        console.log(`❌ Email mismatch for token: ${token.substring(0, 16)}... Expected: ${accessData.email}, Got: ${email}`);
        return res.status(403).json({
            success: false,
            error: 'Email verification failed. This course access is tied to a specific email address.',
            action: 'redirect_to_email'
        });
    }
    
    // Check if access is blocked
    if (!accessData.isActive) {
        return res.status(403).json({
            success: false,
            error: 'Course access has been suspended. Please contact support.',
            action: 'contact_support'
        });
    }
    
    // Check access count limit
    if (accessData.accessCount >= accessData.maxAccess) {
        return res.status(403).json({
            success: false,
            error: 'Maximum access limit reached. Please contact support if you need additional access.',
            action: 'contact_support'
        });
    }
    
    // CRITICAL: Handle new tab detection
    if (isNewTab === 'true' || !tabId) {
        console.log(`🚫 New tab/window detected for token: ${token.substring(0, 16)}...`);
        return res.status(403).json({
            success: false,
            error: 'Course access is restricted to a single browser tab. Please return to your original tab or check your email for the access link.',
            action: 'redirect_to_email',
            isNewTabBlocked: true
        });
    }
    
    // Validate existing session if tabId is provided
    if (tabId) {
        const sessionValidation = sessionManager.validateSession(token, tabId, deviceFingerprint, email);
        
        if (!sessionValidation.valid) {
            let errorMessage = 'Session validation failed.';
            let action = 'redirect_to_email';
            
            switch (sessionValidation.reason) {
                case 'session_not_found':
                    errorMessage = 'Your session has expired or is invalid. Please access the course through the link in your email.';
                    break;
                case 'token_mismatch':
                    errorMessage = 'Security error: Token mismatch detected.';
                    break;
                case 'email_mismatch':
                    errorMessage = 'Security error: Email verification failed.';
                    break;
                case 'device_fingerprint_mismatch':
                    errorMessage = 'Security error: Device verification failed. Course access is locked to your original device.';
                    action = 'contact_support';
                    break;
            }
            
            return res.status(403).json({
                success: false,
                error: errorMessage,
                action: action
            });
        }
        
        // Session is valid, update activity
        console.log(`✅ Session validated: ${tabId.substring(0, 16)}... for ${email}`);
        
        return res.json({
            success: true,
            message: 'Access granted - session validated',
            sessionData: {
                sessionId: sessionValidation.session.sessionId,
                tabId: sessionValidation.session.tabId,
                email: accessData.email,
                heartbeatCount: sessionValidation.session.heartbeatCount
            }
        });
    }
    
    // FIRST TIME ACCESS: Create new secure session
    // Enhanced security checks for new session creation
    if (!accessData.deviceFingerprints) {
        accessData.deviceFingerprints = [];
    }
    
    // Only allow access from a single device
    if (accessData.deviceFingerprints.length > 0 && !accessData.deviceFingerprints.includes(deviceFingerprint)) {
        console.log(`🚫 Different device detected for token: ${token.substring(0, 16)}...`);
        return res.status(403).json({
            success: false,
            error: 'Course access is locked to your original device. Please use the same browser and device where you first accessed the course.',
            action: 'contact_support'
        });
    }
    
    // Track IP addresses (allow some flexibility for same network)
    if (!accessData.ipAddresses.includes(clientIP)) {
        accessData.ipAddresses.push(clientIP);
        
        // Too many different IPs suggests sharing
        if (accessData.ipAddresses.length > 2) {
            console.log(`⚠️ Multiple IP addresses detected for token: ${token.substring(0, 16)}... (${accessData.ipAddresses.length} different IPs)`);
            accessData.isActive = false;
            return res.status(403).json({
                success: false,
                error: 'Multiple IP addresses detected. Course access has been suspended for security reasons.',
                action: 'contact_support'
            });
        }
    }
    
    // Add device fingerprint if it's the first access
    if (!accessData.deviceFingerprints.includes(deviceFingerprint)) {
        accessData.deviceFingerprints.push(deviceFingerprint);
    }
    
    // Create new secure session
    const session = sessionManager.createSession(token, email, deviceFingerprint, clientIP, userAgent);
    
    // Update access data
    accessData.accessCount += 1;
    accessData.lastAccessed = new Date();
    accessData.lastIP = clientIP;
    accessData.lastUserAgent = userAgent;
    
        console.log(`✅ New guide session created for: ${email} (Access count: ${accessData.accessCount}/${accessData.maxAccess})`);
    
    // Return session data for ultra-secure access
    res.json({
        success: true,
        message: 'Access granted - new session created',
        sessionData: {
            sessionId: session.sessionId,
            tabId: session.tabId,
            email: accessData.email,
            purchaseDate: accessData.purchaseDate,
            expiryDate: accessData.expiryDate,
            deviceLocked: true
        }
    });
});

// Heartbeat endpoint to maintain session and detect tab activity
app.post('/api/heartbeat/:token', (req, res) => {
    const { token } = req.params;
    const { tabId, email } = req.body;
    const deviceFingerprint = generateDeviceFingerprint(req);
    
    const sessionValidation = sessionManager.validateSession(token, tabId, deviceFingerprint, email);
    
    if (!sessionValidation.valid) {
        return res.status(403).json({
            success: false,
            error: 'Session expired or invalid',
            action: 'redirect_to_email'
        });
    }
    
    res.json({
        success: true,
        heartbeatCount: sessionValidation.session.heartbeatCount
    });
});

// Session validation endpoint for continuous monitoring
app.post('/api/validate-session/:token', (req, res) => {
    const { token } = req.params;
    const { sessionId, tabId, email, action } = req.body;
    const deviceFingerprint = generateDeviceFingerprint(req);
    
    // Handle session invalidation
    if (action === 'invalidate') {
        sessionManager.invalidateSession(tabId);
        return res.json({ success: true, message: 'Session invalidated' });
    }
    
    // Validate session
    const sessionValidation = sessionManager.validateSession(token, tabId, deviceFingerprint, email);
    
    if (!sessionValidation.valid) {
        let errorMessage = 'Session validation failed.';
        
        switch (sessionValidation.reason) {
            case 'session_not_found':
                errorMessage = 'Session not found or expired.';
                break;
            case 'device_fingerprint_mismatch':
                errorMessage = 'Device verification failed.';
                break;
        }
        
        return res.status(403).json({
            success: false,
            error: errorMessage,
            action: 'redirect_to_email'
        });
    }
    
    res.json({
        success: true,
        valid: true,
        sessionData: {
            sessionId: sessionValidation.session.sessionId,
            tabId: sessionValidation.session.tabId,
            lastActivity: sessionValidation.session.lastActivity,
            heartbeatCount: sessionValidation.session.heartbeatCount
        }
    });
});

// Endpoint to validate session continuity
app.post('/api/validate-session/:token', (req, res) => {
    const { token } = req.params;
    const { sessionId, email } = req.body;
    const deviceFingerprint = generateDeviceFingerprint(req);
    
    const accessData = secureAccessTokens.get(token);
    if (!accessData || accessData.email !== email) {
        return res.status(403).json({
            success: false,
            error: 'Invalid session'
        });
    }
    
    const currentSessionKey = `${token}_${deviceFingerprint}`;
    const session = activeUserSessions.get(currentSessionKey);
    
    if (!session || session.sessionId !== sessionId) {
        console.log(`⚠️ Session validation failed for: ${email}`);
        return res.status(403).json({
            success: false,
            error: 'Session expired or invalid. Please refresh and try again.'
        });
    }
    
    // Update session timestamp
    session.lastAccessed = new Date();
    activeUserSessions.set(currentSessionKey, session);
    
    res.json({
        success: true,
        message: 'Session valid'
    });
});

// Function to send secure guide access via email
async function sendCourseAccess(email, paymentDetails) {
    // Request a secure, single-use link from the secure service
    const SECURE_BASE_URL = process.env.SECURE_BASE_URL || 'http://localhost:4000';
    let secureLink = null;
    try {
        const resp = await fetch(`${SECURE_BASE_URL}/token/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, contentRef: 'shopify-video-intro-guide' })
        });
        if (resp.ok) {
            const data = await resp.json();
            secureLink = data.link || null;
        } else {
            console.error('Secure link creation failed with status', resp.status);
        }
    } catch (e) {
        console.error('Secure link creation error:', e.message);
    }

    // Fallback to legacy link if secure service is unavailable (not recommended for production)
    const courseAccess = secureLink ? { courseUrl: secureLink, accessToken: null } : createCourseAccess(email, paymentDetails);

    // Check if any email service is available
    if (currentEmailService === 'none') {
        console.log(`⚠️ No email service available. Manual delivery required for: ${email}`);
        console.log(`📋 Order details: Payment ID: ${paymentDetails.payment_id}, Order ID: ${paymentDetails.order_id}`);
        console.log(`🎟️ Guide Access URL: ${courseAccess.courseUrl}`);
        
        // Store order for manual processing
        const manualOrder = {
            email,
            paymentDetails,
            guideUrl: courseAccess.courseUrl,
            accessToken: courseAccess.accessToken,
            timestamp: new Date().toISOString(),
            status: 'pending_manual_delivery'
        };
        
        console.log(`💾 Manual delivery required:`, JSON.stringify(manualOrder, null, 2));
        return;
    }
    
    // Determine the sender email based on current service
    let senderEmail = 'code.commerce999@gmail.com';
    if (currentEmailService === 'sendgrid') {
        senderEmail = process.env.SENDGRID_FROM_EMAIL || 'code.commerce999@gmail.com';
    } else if (currentEmailService === 'ethereal') {
        senderEmail = 'test@ethereal.email';
    }

    const mailOptions = {
        from: {
            name: 'Code & Commerce Support',
            address: senderEmail
        },
        to: email,
        subject: 'Your Guide Access - Order Confirmation',
        // Plain text version (important for spam filters)
        text: `
Hello!

Thank you for your purchase of the Shopify Video Intro Guide.

Your payment has been confirmed:
- Payment ID: ${paymentDetails.payment_id}
- Order ID: ${paymentDetails.order_id}
- Amount: ₹${courseContent.price}

Access your guide here: ${courseAccess.courseUrl}

What you'll receive:
• Complete Liquid code snippet
• Theme settings configuration
• Step-by-step implementation guide
• Mobile optimization code
• Performance tips and troubleshooting

Need help? Reply to this email or contact us at code.commerce999@gmail.com

Thank you for your business!

Code & Commerce Team
        `,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            
            <div style="border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 30px;">
                <h2 style="color: #333333; margin: 0;">Order Confirmation</h2>
                <p style="color: #666666; margin: 5px 0;">Shopify Video Intro Guide</p>
            </div>
            
            <p style="color: #333333; line-height: 1.6;">Hello!</p>
            
            <p style="color: #333333; line-height: 1.6;">Thank you for your purchase. Your payment has been confirmed and your guide access is ready.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 25px 0;">
                <h3 style="color: #333333; margin-top: 0;">Payment Details</h3>
                <p style="color: #666666; margin: 5px 0;">Payment ID: <strong>${paymentDetails.payment_id}</strong></p>
                <p style="color: #666666; margin: 5px 0;">Order ID: <strong>${paymentDetails.order_id}</strong></p>
                <p style="color: #666666; margin: 5px 0;">Amount: <strong>₹${courseContent.price}</strong></p>
            </div>
            
                <div style="text-align: center; margin: 30px 0;">
                <a href="${courseAccess.courseUrl}" style="background-color: #007cba; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Access Your Guide (secure)</a>
            </div>
            
            <h3 style="color: #333333;">Guide Contents:</h3>
            <ul style="color: #666666; line-height: 1.8;">
                <li>Complete Liquid code snippet</li>
                <li>Theme settings configuration</li>
                <li>Step-by-step implementation guide</li>
                <li>Mobile optimization code</li>
                <li>Performance tips and troubleshooting</li>
            </ul>
            
            <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666666; font-size: 14px;">Need help? Reply to this email or contact us at <a href="mailto:code.commerce999@gmail.com">code.commerce999@gmail.com</a></p>
                <p style="color: #666666; font-size: 14px;">Thank you for your business!</p>
                <p style="color: #666666; font-size: 12px; margin-top: 20px;">Code & Commerce Team</p>
            </div>
            
        </div>
        `
    };

    try {
        // Attempt to send email
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Secure guide access email sent via ${currentEmailService}:`, info.messageId);
        console.log(`🎟️ Guide URL: ${courseAccess.courseUrl.substring(0, 50)}...`);
        
        // Log preview URL for Ethereal testing
        if (currentEmailService === 'ethereal') {
            console.log(`🔗 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        
        return info;
    } catch (emailError) {
        console.error(`❌ Email sending failed via ${currentEmailService}:`, emailError.message);
        
        // Log manual delivery requirement with guide access
        const manualOrder = {
            email,
            paymentDetails,
            guideUrl: courseAccess.courseUrl,
            accessToken: courseAccess.accessToken,
            timestamp: new Date().toISOString(),
            status: 'email_failed_manual_required',
            service_attempted: currentEmailService,
            error: emailError.message
        };
        
        console.log(`📝 Email failed - Manual delivery required:`, JSON.stringify(manualOrder, null, 2));
        return null;
    }
}

// Error handling
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Initialize email transporter and start server
async function startServer() {
    try {
        // Initialize email transporter with fallback logic
        console.log('🔄 Initializing email services...');
        await initializeEmailTransporter();
        
        // Start the server
        app.listen(PORT, () => {
            console.log(`🚀 Shopify Video Intro Guide server running on port ${PORT}`);
            console.log(`💰 Guide price: ₹${courseContent.price}`);
            console.log(`📧 Support email: code.commerce999@gmail.com`);
            console.log(`🔒 UPI payments enabled via Razorpay`);
            console.log(`📨 Email service: ${currentEmailService}`);
            console.log('🟢 Server ready to handle requests');
        });
        
    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
}

// Start the server
startServer();

module.exports = app;
