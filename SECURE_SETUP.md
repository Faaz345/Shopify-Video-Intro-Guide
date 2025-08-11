# Secure Access System Setup Guide

## Overview

This secure access system provides ultra-secure, single-use, time-limited access to your Shopify Video Intro Guide after purchase. The system includes:

- **Cryptographically secure tokens** with 10-minute expiry
- **One-Time Password (OTP) verification** via email
- **Device fingerprinting** to prevent sharing across devices
- **Session management** with automatic cleanup
- **Rate limiting** to prevent brute force attacks
- **Secure content delivery** with download tracking

## Security Features

### 1. Token-Based Access
- Cryptographically secure 64-character tokens
- 10-minute expiry time from creation
- Single-use tokens that cannot be reused
- Database-stored with comprehensive metadata

### 2. Email OTP Verification
- 6-digit OTP sent to purchaser's email
- 10-minute OTP expiry
- Maximum 5 OTP attempts before blocking
- Device fingerprint verification

### 3. Device & Session Security
- Advanced device fingerprinting using multiple browser characteristics
- Session-locked access (cannot be shared across tabs/windows)
- IP address tracking with suspicious activity detection
- Automatic session cleanup and expiry

### 4. Content Protection
- Files served through authenticated endpoints only
- No direct static file access
- Download tracking and limits
- Browser security measures (disable F12, right-click, etc.)

## Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (local or cloud instance)
3. **Gmail App Password** (for email sending)
4. **Razorpay Account** (for payment processing)

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the environment template and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/shopify_secure_access

# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_razorpay_secret

# Email Configuration (Gmail with App Password)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password

# Security Configuration
SESSION_SECRET=generate-a-random-64-character-string
JWT_SECRET=another-random-secret-key

# Server Configuration
PORT=3000
BASE_URL=http://localhost:3000
```

### 3. Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Step Verification
3. Go to "App passwords" 
4. Generate a new app password for "Mail"
5. Use this 16-character password in `GMAIL_APP_PASSWORD`

### 4. MongoDB Setup

**Option A: Local MongoDB**
```bash
# Install MongoDB locally
# Windows: Download from mongodb.com
# macOS: brew install mongodb/brew/mongodb-community
# Ubuntu: sudo apt install mongodb

# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create account at mongodb.com/atlas
2. Create a new cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

## Starting the Secure Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

### Using the Secure Server
```bash
node secure-server.js
```

## API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Main website |
| GET | `/access` | Secure access page |
| POST | `/api/create-order` | Create Razorpay order |
| POST | `/api/verify-payment` | Verify payment and create secure token |

### Secure Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/secure-access/:token` | Verify token and send OTP |
| POST | `/api/verify-otp/:token` | Verify OTP and create session |
| GET | `/secure-content/:sessionToken` | Serve secure content page |
| GET | `/api/download/:sessionToken/:filename` | Download protected files |

## Security Flow

### 1. Payment Verification
```
User completes payment → Razorpay webhook → Create secure token → Send access email
```

### 2. Secure Access
```
User clicks email link → Token verification → OTP generation → Email OTP → User enters OTP → Session creation → Content access
```

### 3. Content Delivery
```
Authenticated session → Device verification → File serving → Download tracking → Session cleanup
```

## Database Models

### SecureAccess Model
```javascript
{
  token: String,           // Cryptographically secure token
  email: String,           // User's email
  paymentId: String,       // Razorpay payment ID
  orderId: String,         // Razorpay order ID
  amount: Number,          // Payment amount
  isUsed: Boolean,         // Token usage status
  isExpired: Boolean,      // Expiry status
  isBlocked: Boolean,      // Security block status
  deviceFingerprint: String, // Device identification
  otpCode: String,         // Current OTP
  otpExpiry: Date,         // OTP expiration
  otpVerified: Boolean,    // OTP verification status
  createdAt: Date,         // Token creation time
  completedAt: Date        // Access completion time
}
```

## Testing the System

### 1. End-to-End Test
1. Complete a test payment
2. Check email for secure access link
3. Click link to verify token
4. Enter OTP from second email
5. Access and download content

### 2. Security Tests
1. Try accessing with expired token
2. Test OTP with wrong codes
3. Attempt access from different device
4. Try sharing session URLs

### 3. Email Testing
```bash
# Test email configuration
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
transporter.sendMail({
  from: 'your-email@gmail.com',
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'Email configuration working!'
}, (err, info) => {
  console.log(err || 'Email sent successfully!');
});
"
```

## Monitoring & Logs

The system provides detailed logging for:
- Token creation and verification
- OTP generation and verification  
- Session management
- Security violations
- Content access tracking

### Log Examples
```
✅ Secure access created for: user@example.com (Token: a1b2c3d4...)
🔐 New secure session created: 1a2b3c4d... for user@example.com
🚫 Security violation detected: Device fingerprint mismatch
📧 OTP email sent to: user@example.com (message-id)
```

## Production Deployment

### 1. Environment Variables
- Set `NODE_ENV=production`
- Use strong, unique secrets
- Configure HTTPS (SSL/TLS)
- Set up proper CORS origins

### 2. Database Security
- Use MongoDB Atlas with authentication
- Enable database encryption
- Set up regular backups
- Configure IP whitelisting

### 3. Server Security
- Deploy with HTTPS only
- Use proper firewall rules
- Set up rate limiting
- Monitor for suspicious activity

### 4. Email Reliability
- Configure backup email service (SendGrid)
- Set up email delivery monitoring
- Configure SPF, DKIM, DMARC records

## Troubleshooting

### Common Issues

**Email not sending:**
```bash
# Check Gmail app password
# Verify 2-step verification is enabled
# Test SMTP connection
```

**MongoDB connection failed:**
```bash
# Check MongoDB is running
# Verify connection string
# Check network connectivity
```

**Token verification fails:**
```bash
# Check token format
# Verify database connection
# Check token expiry time
```

**OTP not received:**
```bash
# Check spam folder
# Verify email configuration
# Check rate limiting
```

### Debug Mode

Enable detailed logging:
```javascript
// Add to secure-server.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${req.ip}`);
  next();
});
```

## Support

For technical support or implementation assistance:
- **Email**: code.commerce999@gmail.com
- **Response Time**: Within 24 hours
- **Include**: Server logs, error messages, environment details

## Security Best Practices

1. **Regular Updates**: Keep all dependencies updated
2. **Log Monitoring**: Monitor access logs for suspicious activity
3. **Backup Strategy**: Regular database backups
4. **Secret Rotation**: Regularly rotate JWT and session secrets
5. **HTTPS Only**: Never run in production without HTTPS
6. **Rate Limiting**: Implement appropriate rate limits
7. **Input Validation**: Validate all user inputs
8. **Error Handling**: Avoid exposing sensitive information in errors

## License

This secure access system is proprietary software. Unauthorized distribution or modification is prohibited.

---

**Created with ❤️ by Code & Commerce**  
*Secure, reliable, and user-friendly digital content delivery*
