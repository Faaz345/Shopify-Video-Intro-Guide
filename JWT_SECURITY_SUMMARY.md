# 🔐 JWT Security Implementation Summary

## System Overview

The RazorPay Payment Gateway system now implements **JWT-based authentication** to secure the Shopify Video Intro Guide website. Only users who have completed payment can access the guide content.

## 🏗️ Architecture

### Two-Server Setup

1. **Payment Server** (`server-shopify.js`)
   - Port: 5000
   - Handles Razorpay payments
   - Generates JWT tokens after successful payment
   - Sends email with secure access link

2. **Guide Website** (`video-intro-guide-shopify`)
   - Port: 3005
   - Protected Next.js application
   - JWT middleware validates all requests
   - Shows guide content only to authorized users

## 🔄 Complete Flow

### Purchase → Access Flow

```
1. Customer visits payment page (http://localhost:5000)
   ↓
2. Completes payment via Razorpay
   ↓
3. Payment server verifies payment
   ↓
4. Server generates JWT token with:
   - Email address
   - Payment ID
   - Order ID
   - isPaid: true
   - 30-day expiry
   ↓
5. Email sent with secure link:
   http://localhost:3005/set?token=JWT_TOKEN_HERE
   ↓
6. Customer clicks link
   ↓
7. Guide website validates JWT token
   ↓
8. Sets HTTP-only secure cookie
   ↓
9. Redirects to guide content
   ↓
10. All subsequent requests validated via cookie
```

## 🔒 Security Features

### JWT Token Security
- **Algorithm**: HS256
- **Secret**: `my_super_secret_jwt_key_for_development_2024`
- **Expiry**: 30 days
- **Cookie**: HTTP-only, Secure, SameSite=Lax

### Token Payload Structure
```json
{
  "email": "customer@example.com",
  "isPaid": true,
  "orderId": "order_R42km8wPgfnTz7",
  "paymentId": "pay_R42kuhAnj3H5jJ",
  "purchaseDate": "2025-08-11T13:37:22.065Z",
  "courseAccess": "shopify-video-intro-guide",
  "iat": 1754919442,
  "exp": 1757511442
}
```

### Middleware Protection (`middleware.ts`)
```typescript
// All routes protected except:
- /_next/* (Next.js assets)
- /favicon.ico
- /unauthorized (error page)
- /set (token validation endpoint)

// Protected routes check for:
1. Valid JWT cookie
2. Proper signature
3. Not expired
4. Correct secret
```

## 🚫 Unauthorized Access Handling

### Scenarios Blocked:

1. **Direct Access Without Token**
   - URL: `http://localhost:3005`
   - Result: Redirected to `/unauthorized`

2. **Expired Token**
   - Token older than 30 days
   - Result: Redirected to `/unauthorized`

3. **Invalid Signature**
   - Token signed with wrong secret
   - Result: Redirected to `/unauthorized`

4. **Modified Token**
   - Any tampering with JWT
   - Result: Redirected to `/unauthorized`

## 🛠️ Configuration

### Environment Variables

**Main Server** (`.env`):
```env
GUIDE_JWT_SECRET=my_super_secret_jwt_key_for_development_2024
FRONTEND_URL=http://localhost:5000
COURSE_FRONTEND_URL=http://localhost:3005
```

**Guide Website** (`.env.local`):
```env
GUIDE_JWT_SECRET=my_super_secret_jwt_key_for_development_2024
```

## 📝 Key Files Modified

1. **server-shopify.js**
   - Added JWT token generation
   - Modified `createCourseAccess()` function
   - Returns JWT token in access URL

2. **middleware.ts** (Guide Website)
   - JWT validation middleware
   - Cookie checking
   - Route protection

3. **pages/set.tsx** (Guide Website)
   - Token validation endpoint
   - Cookie setting
   - Redirect logic

4. **pages/unauthorized.tsx** (Guide Website)
   - Error page for unauthorized access

## 🔧 Testing

### Test Commands

```bash
# Test JWT flow
node test-jwt-flow.js

# Test complete payment to access flow
node test-complete-flow.js

# Test payment flow
node test-payment-flow.js
```

### Manual Testing

1. **Test Unauthorized Access**:
   - Visit: http://localhost:3005
   - Expected: Redirect to /unauthorized

2. **Test with Valid Token**:
   - Generate token via payment
   - Visit link from email
   - Expected: Access granted to guide

## 🎯 Current Status

✅ **WORKING CORRECTLY**:
- JWT token generation after payment
- Token validation in guide website
- Cookie-based session management
- Unauthorized access prevention
- Proper redirects for invalid tokens

## 🔐 Additional Security Layers

Beyond JWT, the system also includes:

1. **Device Fingerprinting** (in payment server)
   - Tracks device changes
   - Prevents sharing across devices

2. **IP Monitoring**
   - Maximum 3 different IPs
   - Detects suspicious activity

3. **Access Limits**
   - Maximum 50 access attempts
   - Prevents scraping/abuse

4. **Session Management**
   - Single-tab enforcement
   - Heartbeat monitoring

## 📌 Important Notes

1. **JWT Secret**: Must be the same in both servers
2. **Cookie Security**: Use HTTPS in production
3. **Token Expiry**: 30 days (configurable)
4. **URL Format**: `/set?token=` for initial access
5. **Subsequent Access**: Via HTTP-only cookie

## 🚀 Production Deployment

For production:

1. Use strong, unique JWT secret
2. Enable HTTPS for secure cookies
3. Set appropriate CORS origins
4. Use production database (MongoDB)
5. Configure proper email service
6. Set production Razorpay keys

## 💡 Troubleshooting

**Issue**: "Unauthorized" error when accessing guide
- Check JWT secret matches in both .env files
- Verify token hasn't expired
- Check cookies are enabled in browser

**Issue**: Email link doesn't work
- Verify COURSE_FRONTEND_URL in .env
- Check token is properly generated
- Ensure guide website is running

**Issue**: Token validation fails
- Check GUIDE_JWT_SECRET environment variable
- Verify middleware.ts is properly configured
- Ensure .env.local exists in guide website

---

**System is now fully secured with JWT authentication!** 🎉
