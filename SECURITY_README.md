# Enhanced Course Access Security System

## Overview

This system implements comprehensive security measures to prevent URL sharing across different devices, browsers, tabs, and incognito windows. It combines server-side validation with advanced client-side monitoring to ensure course access remains personal and non-transferable.

## 🔒 Security Features

### Server-Side Security

1. **Device Fingerprinting**
   - Generates unique device signatures based on User-Agent, Accept headers, and IP address
   - Tracks multiple device access attempts
   - Blocks access when more than 2 different devices are detected

2. **Session Management**
   - Creates unique session IDs for each access attempt
   - Validates session continuity across requests
   - Detects concurrent sessions from different devices

3. **IP Address Monitoring**
   - Tracks and limits IP addresses per token (max 3 different IPs)
   - Flags suspicious activity when multiple IPs are detected
   - Logs all access attempts with IP information

4. **Access Control**
   - Limits total access attempts per token (50 maximum)
   - Enforces 1-year expiry period
   - Tracks access count and usage patterns

5. **Suspicious Activity Detection**
   - Monitors rapid successive requests
   - Detects potential sharing patterns
   - Automatically blocks tokens showing abuse

### Client-Side Security

1. **Real-time Validation**
   - Validates access token on page load
   - Re-validates every 5 minutes
   - Checks session continuity every 30 seconds

2. **Activity Monitoring**
   - Tracks user interaction (mouse, keyboard, scroll)
   - Detects inactivity periods
   - Re-validates after 5 minutes of inactivity

3. **Tab/Window Detection**
   - Monitors page visibility changes
   - Detects when users switch tabs
   - Validates session when returning to tab

4. **Developer Tools Protection**
   - Detects when dev tools are opened
   - Shows security warnings
   - Blocks right-click and keyboard shortcuts for unauthorized users

5. **Heartbeat System**
   - Sends periodic heartbeats to server
   - Confirms user is actively using the content
   - Detects disconnected or shared sessions

## 🚀 Implementation

### Backend Integration

The enhanced security is built into `server-shopify.js`:

```javascript
// Key endpoints:
GET  /api/verify-access/:token     - Validates token with enhanced security
POST /api/validate-session/:token - Validates ongoing session
```

### Frontend Integration

Add the security script to your course website:

```html
<script src="./course-access-guard.js"></script>
```

The script automatically:
- Validates access on page load
- Sets up monitoring systems
- Blocks unauthorized access
- Shows appropriate user messages

## 📊 Security Monitoring

### Admin Dashboard Features

1. **Real-time Monitoring**
   - View active sessions
   - Monitor suspicious activity
   - Track access patterns

2. **Security Alerts**
   - Multiple device detection
   - Excessive IP usage
   - Rapid request patterns

3. **Token Management**
   - Block/unblock tokens
   - Reset access limits
   - Extend expiry dates

### Logging System

All security events are logged with:
- Timestamp
- User email
- IP address
- Device fingerprint
- Action taken
- Reason for action

## 🛡️ Anti-Sharing Mechanisms

### What Prevents Sharing

1. **Email Verification**
   - Token tied to specific email address
   - Email must match for access

2. **Device Limitations**
   - Maximum 2 different devices
   - Device fingerprinting prevents spoofing
   - Session validation across requests

3. **Usage Tracking**
   - Limited to 50 access attempts
   - Tracks concurrent usage
   - Detects sharing patterns

4. **Time-based Validation**
   - Regular re-validation
   - Session continuity checks
   - Activity monitoring

### What Happens When Sharing is Detected

1. **Warning Phase**
   - Security notices shown
   - Activity monitoring increased
   - Additional validations triggered

2. **Restriction Phase**
   - Access temporarily limited
   - Require additional verification
   - Show sharing prevention messages

3. **Block Phase**
   - Token permanently disabled
   - All access revoked
   - Manual support intervention required

## 🔧 Configuration

### Backend Configuration

```javascript
// In server-shopify.js, configure these limits:
const accessData = {
    maxAccess: 50,              // Maximum access attempts
    maxDevices: 2,              // Maximum different devices
    maxIPs: 3,                  // Maximum different IP addresses
    expiryPeriod: 365,          // Days until expiry
    sessionTimeout: 300000      // Session timeout (5 minutes)
};
```

### Frontend Configuration

```javascript
// In course-access-guard.js:
const CONFIG = {
    ACCESS_CHECK_INTERVAL: 300000,    // Re-check every 5 minutes
    SESSION_CHECK_INTERVAL: 30000,    // Session check every 30 seconds
    MAX_INACTIVE_TIME: 300000,        // 5 minutes inactivity limit
    HEARTBEAT_INTERVAL: 60000         // Heartbeat every minute
};
```

## 🚨 Bypass Prevention

### Technical Measures

1. **Script Obfuscation**
   - Minified and obfuscated client code
   - Dynamic variable names
   - Encrypted communication

2. **Server-side Validation**
   - All critical checks on server
   - Client-side is supplementary only
   - Multiple validation layers

3. **Token Encryption**
   - Cryptographically secure tokens
   - Regular token rotation
   - Signed and verified access

4. **Network Protection**
   - Rate limiting
   - DDoS protection
   - SSL/TLS encryption

### Behavioral Analysis

1. **Access Patterns**
   - Time-based analysis
   - Geographic distribution
   - Usage frequency

2. **Device Behavior**
   - Browser fingerprinting
   - Screen resolution tracking
   - Input method detection

3. **Network Analysis**
   - VPN detection
   - Proxy identification
   - ISP tracking

## 📈 Performance Impact

### Client-Side
- Minimal performance impact
- Lazy loading of security features
- Efficient event handling
- Optimized network requests

### Server-Side
- Cached token validations
- Database query optimization
- Memory-efficient session storage
- Background security processing

## 🔍 Troubleshooting

### Common Issues

1. **Access Denied for Legitimate Users**
   - Check device limits
   - Verify email spelling
   - Clear browser data
   - Contact support

2. **Session Expired Messages**
   - Network connectivity issues
   - Server maintenance
   - Token expiry
   - Multiple device usage

3. **Suspicious Activity Warnings**
   - Developer tools usage
   - Multiple tab switching
   - VPN/proxy usage
   - Shared network environments

### Resolution Steps

1. **For Users**
   - Use original purchase email
   - Access from single device
   - Avoid developer tools
   - Contact support if issues persist

2. **For Admins**
   - Check server logs
   - Review security alerts
   - Reset user tokens if needed
   - Adjust security thresholds

## 🎯 Best Practices

### For Implementation

1. **Server Setup**
   - Use HTTPS everywhere
   - Implement proper CORS
   - Set up monitoring
   - Regular security updates

2. **Client Integration**
   - Load security script first
   - Test across browsers
   - Monitor error logs
   - User feedback collection

### For Users

1. **Recommended Usage**
   - Access from single device
   - Keep browser updated
   - Stable internet connection
   - Bookmark the course page

2. **Avoid These Actions**
   - Sharing access URLs
   - Using developer tools
   - Multiple simultaneous sessions
   - VPN switching during use

## 📞 Support

For security-related issues:
- Email: code.commerce999@gmail.com
- Subject: Security Issue - Course Access
- Include: Token ID (first 16 characters), Error message, Steps taken

Response time: Within 24 hours

## 🔄 Updates

### Version History

- **v1.0** - Basic token validation
- **v2.0** - Enhanced security with device fingerprinting
- **v2.1** - Session management and monitoring
- **v2.2** - Suspicious activity detection
- **v3.0** - Comprehensive anti-sharing system

### Planned Features

- Machine learning-based anomaly detection
- Biometric validation integration
- Advanced bot detection
- Real-time security dashboard
- Mobile app support

## ⚖️ Legal Compliance

This security system complies with:
- GDPR data protection requirements
- User privacy standards
- Fair use policies
- Educational content protection laws

User data is encrypted, access is logged for security purposes only, and personal information is protected according to our privacy policy.

---

Created with 🔒 by Code & Commerce
