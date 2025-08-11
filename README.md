# Secure Razorpay Payment Gateway with Access Control

This project creates a secure payment system that prevents link sharing and ensures only paying users can access protected content.

## 🔒 Security Features

- **Device Fingerprinting**: Access is tied to the original payment device
- **JWT Authentication**: Secure token-based authentication
- **Payment Verification**: Proper Razorpay signature verification
- **Content Protection**: Prevents right-click, dev tools, and content saving
- **Auto-logout**: Session expires after inactivity
- **Suspicious Activity Detection**: Blocks accounts with unusual access patterns

## 🚀 Setup Instructions

### 1. Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Razorpay account (for payment processing)

### 2. Backend Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Fill in your Razorpay credentials:
     ```
     RAZORPAY_KEY_ID=your_razorpay_key_id
     RAZORPAY_KEY_SECRET=your_razorpay_secret_key
     ```
   - Configure other variables:
     ```
     MONGODB_URI=mongodb://localhost:27017/razorpay-secure
     JWT_SECRET=your_super_secret_jwt_key
     FRONTEND_URL=https://shopify-intro-guide.vercel.app
     PAYMENT_AMOUNT=99900  # ₹999 in paise
     ```

3. **Start the Server**
   ```bash
   npm run dev  # Development
   # or
   npm start    # Production
   ```

### 3. Frontend Integration

#### Option A: Standalone Payment Page
Deploy the `public/payment.html` file to handle payments separately.

#### Option B: Integrate with Existing Site
Add the access guard to your Shopify site:

1. **Add the access guard script** to your site's head section:
   ```html
   <script src="/access-guard.js"></script>
   ```

2. **Modify your site structure** to include a payment page route.

### 4. Shopify Integration

1. **Upload Files to Shopify**:
   - Upload `payment.html` to your Shopify assets
   - Upload `access-guard.js` to your Shopify assets

2. **Add to Theme**:
   ```liquid
   <!-- In your theme.liquid head section -->
   {{ 'access-guard.js' | asset_url | script_tag }}
   ```

3. **Create Payment Page**:
   - Create a new page template in Shopify
   - Use the payment.html content

### 5. Deployment

#### Backend Deployment (Recommended: Heroku/Railway/DigitalOcean)

1. **Heroku Example**:
   ```bash
   # Install Heroku CLI
   heroku create your-app-name
   heroku config:set RAZORPAY_KEY_ID=your_key
   heroku config:set RAZORPAY_KEY_SECRET=your_secret
   heroku config:set MONGODB_URI=your_mongodb_uri
   heroku config:set JWT_SECRET=your_jwt_secret
   git push heroku main
   ```

2. **Update API URLs**:
   - In `payment.html`, update `API_BASE` to your deployed backend URL
   - In `access-guard.js`, update `API_BASE` to your deployed backend URL

## 🔧 Configuration

### Payment Amount
Change the payment amount in `.env`:
```
PAYMENT_AMOUNT=99900  # ₹999 in paise (100 paise = ₹1)
```

### Security Settings
- **Session Timeout**: Modify `INACTIVITY_TIMEOUT` in access-guard.js
- **Device Fingerprint Components**: Customize in `generateDeviceFingerprint()`
- **Access Restrictions**: Modify security measures in `addSecurityMeasures()`

## 🛡️ How Security Works

### 1. Device Fingerprinting
- Creates unique fingerprint based on:
  - User agent
  - Accept languages
  - Accept encoding
  - IP address
- Stored during payment and verified on each access

### 2. Access Flow
1. User makes payment → Device fingerprint created
2. User gets unique access URL with token
3. On site visit → Device verified + JWT validated
4. If device mismatch → Account blocked
5. If sharing detected → Access denied

### 3. Content Protection
- Disables right-click, F12, Ctrl+U
- Prevents text selection and dragging
- Detects developer tools opening
- Auto-logout on inactivity
- Blurs content if suspicious activity detected

## 📱 API Endpoints

- `POST /api/create-order` - Create Razorpay order
- `POST /api/verify-payment` - Verify payment and create user
- `GET /api/validate-access` - Validate user access
- `POST /api/login` - Login for existing users
- `GET /health` - Health check

## ⚠️ Important Security Notes

1. **HTTPS Required**: Always use HTTPS in production
2. **Environment Variables**: Keep secrets secure
3. **CORS Configuration**: Set proper CORS origins
4. **Rate Limiting**: Built-in rate limiting active
5. **Database Security**: Use MongoDB authentication
6. **Regular Updates**: Keep dependencies updated

## 🔍 Testing

### Test Payment Flow
1. Start backend server
2. Open payment.html in browser
3. Enter email and password
4. Complete test payment (use Razorpay test mode)
5. Verify access to protected content

### Test Security
- Try accessing without payment
- Try sharing link to different browser
- Test device fingerprint validation
- Verify content protection measures

## 🚨 Troubleshooting

### Common Issues
1. **CORS Errors**: Check `FRONTEND_URL` in .env
2. **Payment Verification Failed**: Verify Razorpay keys
3. **Device Mismatch**: Clear localStorage and try again
4. **MongoDB Connection**: Check MongoDB URI and connectivity

### Debug Mode
Enable debug logging by setting:
```
NODE_ENV=development
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the console logs
3. Verify all environment variables
4. Test with Razorpay test mode first

## 📄 License

This project is for educational purposes. Ensure compliance with your local laws and Razorpay's terms of service.
