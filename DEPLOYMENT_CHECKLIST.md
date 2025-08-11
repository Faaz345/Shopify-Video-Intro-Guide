# 🚀 Deployment Checklist for Shopify Video Intro Guide

## ✅ Pre-Deployment Steps (Already Completed)
- [x] Production server created (`server-production.js`)
- [x] Environment template created (`.env.production`)
- [x] Package.json updated with production script
- [x] Code pushed to GitHub repository
- [x] All dependencies listed in package.json

## 📋 Step 1: Setup MongoDB Atlas (5 minutes)

1. **Create MongoDB Atlas Account:**
   - Visit: https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google or email
   - Choose the FREE tier (M0 Sandbox)

2. **Configure Database:**
   - [ ] Create a new cluster (choose nearest region)
   - [ ] Wait for cluster creation (2-3 minutes)
   - [ ] Go to Database Access → Add New Database User
     - Username: `shopifyguide`
     - Password: Generate secure password
     - Save this password!

3. **Configure Network Access:**
   - [ ] Go to Network Access
   - [ ] Click "Add IP Address"
   - [ ] Click "Allow Access from Anywhere" (0.0.0.0/0)
   - [ ] Confirm

4. **Get Connection String:**
   - [ ] Click "Connect" on your cluster
   - [ ] Choose "Connect your application"
   - [ ] Copy the connection string
   - [ ] Replace `<password>` with your actual password
   - [ ] Save this string for later

## 📋 Step 2: Setup Gmail App Password (2 minutes)

1. **Enable 2-Step Verification:**
   - [ ] Go to: https://myaccount.google.com/security
   - [ ] Enable 2-Step Verification if not already enabled

2. **Generate App Password:**
   - [ ] Go to: https://myaccount.google.com/apppasswords
   - [ ] Select "Mail" from dropdown
   - [ ] Click "Generate"
   - [ ] Copy the 16-character password
   - [ ] Save this password!

## 📋 Step 3: Deploy to Render.com (10 minutes)

1. **Create Render Account:**
   - [ ] Go to: https://render.com
   - [ ] Sign up with GitHub (important!)
   - [ ] Authorize Render to access your repositories

2. **Create New Web Service:**
   - [ ] Click "New +" → "Web Service"
   - [ ] Connect repository: `Faaz345/Shopify-Video-Intro-Guide`
   - [ ] Configure settings:
     - **Name**: `shopify-video-guide`
     - **Region**: Choose nearest to your customers
     - **Branch**: `main`
     - **Runtime**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Instance Type**: Free

3. **Add Environment Variables:**
   Click "Environment" tab and add these variables:

   ```
   NODE_ENV=production
   PORT=10000
   BASE_URL=https://shopify-video-guide.onrender.com
   
   # MongoDB (paste your connection string from Step 1)
   MONGODB_URI=mongodb+srv://shopifyguide:YOUR_PASSWORD@cluster.mongodb.net/shopify-guide?retryWrites=true&w=majority
   
   # Razorpay Test Keys (for initial testing)
   RAZORPAY_KEY_ID=rzp_test_svuJcv020PyvU9
   RAZORPAY_KEY_SECRET=s5ffeTjwaDB0MSbBm6yZvjoN
   
   # Email (from Step 2)
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-16-character-app-password
   
   # Security (generate random strings)
   GUIDE_JWT_SECRET=generate-64-random-characters-here-keep-it-secret-12345678
   SESSION_SECRET=another-64-random-characters-here-also-keep-secret-87654321
   
   # Course Price
   COURSE_PRICE=599
   
   # CORS
   ALLOWED_ORIGINS=https://shopify-video-guide.onrender.com
   ```

4. **Deploy:**
   - [ ] Click "Create Web Service"
   - [ ] Wait for deployment (5-10 minutes)
   - [ ] Check logs for any errors

## 📋 Step 4: Test Your Deployment

1. **Basic Health Check:**
   - [ ] Visit: `https://shopify-video-guide.onrender.com/health`
   - [ ] Should see: `{"status":"ok","environment":"production"}`

2. **Test Payment Page:**
   - [ ] Visit: `https://shopify-video-guide.onrender.com`
   - [ ] Page should load without errors
   - [ ] Check browser console for any errors

3. **Test Payment Flow:**
   - [ ] Click "Buy Now" button
   - [ ] Use test card: `4111 1111 1111 1111`
   - [ ] Any future date for expiry
   - [ ] Any 3 digits for CVV
   - [ ] Complete payment
   - [ ] Check email for access link

4. **Test Guide Access:**
   - [ ] Click link in email
   - [ ] Should redirect to protected guide
   - [ ] Verify guide content loads

## 📋 Step 5: Switch to Production (After Testing)

1. **Get Razorpay Live Keys:**
   - [ ] Login to: https://dashboard.razorpay.com
   - [ ] Switch to "Live Mode"
   - [ ] Go to Settings → API Keys
   - [ ] Generate Live Keys
   - [ ] Copy Key ID and Secret

2. **Update Render Environment:**
   - [ ] Go to Render Dashboard
   - [ ] Click on your service
   - [ ] Go to Environment tab
   - [ ] Update:
     ```
     RAZORPAY_KEY_ID=rzp_live_YOUR_ACTUAL_KEY
     RAZORPAY_KEY_SECRET=YOUR_ACTUAL_SECRET
     ```
   - [ ] Save changes (will auto-redeploy)

3. **Final Production Test:**
   - [ ] Make a real payment (₹1 test)
   - [ ] Verify payment goes through
   - [ ] Check Razorpay dashboard for transaction
   - [ ] Verify email delivery
   - [ ] Test guide access

## 🛠️ Troubleshooting Commands

If you need to debug:

```bash
# View Render logs
# Go to Render Dashboard → Your Service → Logs

# Test locally with production config
set NODE_ENV=production
node server-production.js

# Check MongoDB connection
# Use MongoDB Compass with your connection string

# Test email manually
node test-gmail.js
```

## 📊 Post-Deployment Monitoring

1. **Setup Monitoring (Optional):**
   - [ ] Sign up for UptimeRobot (free)
   - [ ] Add monitor for: `https://shopify-video-guide.onrender.com`
   - [ ] Set check interval: 5 minutes
   - [ ] Configure email alerts

2. **Check Daily:**
   - [ ] Render Dashboard for any errors
   - [ ] MongoDB Atlas for database usage
   - [ ] Razorpay Dashboard for payments

## 🎉 Success Indicators

Your deployment is successful when:
- ✅ Health endpoint returns "ok"
- ✅ Payment page loads without errors
- ✅ Test payment completes successfully
- ✅ Email with access link is received
- ✅ Protected guide is accessible via token
- ✅ No errors in Render logs

## 📝 Important URLs After Deployment

- **Your App**: https://shopify-video-guide.onrender.com
- **Health Check**: https://shopify-video-guide.onrender.com/health
- **Render Dashboard**: https://dashboard.render.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Razorpay Dashboard**: https://dashboard.razorpay.com

## 🔐 Security Notes

- Never commit `.env` files
- Keep all secret keys secure
- Regularly check MongoDB Atlas security settings
- Monitor Razorpay for suspicious transactions
- Update dependencies regularly

---

**Deployment Time Estimate: 20-30 minutes total**

Need help? Check the logs first, then refer to DEPLOYMENT_GUIDE.md for detailed troubleshooting.
