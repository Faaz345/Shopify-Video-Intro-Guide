# 🚀 Quick Deployment to Render.com (5 Minutes)

## Step 1: Prepare GitHub Repository

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial deployment"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/shopify-guide.git
git push -u origin main
```

## Step 2: Get Required Accounts (If you don't have)

1. **MongoDB Atlas** (2 min)
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up → Create FREE M0 Cluster
   - Security → Database Access → Add User
   - Network Access → Add IP: 0.0.0.0/0 (Allow all)
   - Get connection string from Connect button

2. **Gmail App Password** (1 min)
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" → Generate
   - Copy the 16-character password

## Step 3: Deploy to Render

1. **Sign up at Render.com**
   - Go to: https://render.com
   - Sign up with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect GitHub → Select your repo
   - Settings:
     - **Name**: shopify-guide-app
     - **Build Command**: `npm install`
     - **Start Command**: `node server-production.js`

3. **Add Environment Variables**
   Click "Environment" tab and add these (copy & paste):

```env
NODE_ENV=production
PORT=3000
BASE_URL=https://shopify-guide-app.onrender.com

# MongoDB (paste your connection string)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shopify-guide?retryWrites=true&w=majority

# Razorpay (use test keys first)
RAZORPAY_KEY_ID=rzp_test_svuJcv020PyvU9
RAZORPAY_KEY_SECRET=s5ffeTjwaDB0MSbBm6yZvjoN

# Email
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password

# Security (generate random strings)
GUIDE_JWT_SECRET=your-random-64-character-string-here-keep-it-secret
SESSION_SECRET=another-random-64-character-string-here-also-secret

# Course
COURSE_PRICE=599
```

4. **Click "Create Web Service"**
   - Wait 5-10 minutes for deployment
   - Your app will be live at: `https://shopify-guide-app.onrender.com`

## Step 4: Test Your Deployment

1. Visit your URL: `https://shopify-guide-app.onrender.com`
2. Make a test payment (Card: 4111 1111 1111 1111)
3. Check email for access link
4. Verify guide access works

## Step 5: Go Live with Real Payments

Replace test Razorpay keys with live ones:
- Login to Razorpay Dashboard
- Switch to Live Mode
- Get Live keys from Settings → API Keys
- Update in Render Environment Variables

## 🎉 That's it! Your app is now live!

---

## Quick Commands for Updates

```bash
# Make changes locally
git add .
git commit -m "Update description"
git push origin main
# Render auto-deploys in 2-3 minutes
```

## Free Limits
- **Render**: 750 hours/month (enough for 1 app 24/7)
- **MongoDB Atlas**: 512MB storage (thousands of orders)
- **Gmail**: 500 emails/day

## Need Help?
- Check Render logs: Dashboard → Logs
- MongoDB issues: Check connection string format
- Payment issues: Verify Razorpay keys

**Your payment gateway + protected guide system is now live! 🚀**
