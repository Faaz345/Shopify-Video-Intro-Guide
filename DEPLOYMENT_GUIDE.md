# 🚀 Complete Deployment Guide

## Overview
This guide will help you deploy your Shopify Video Intro Guide with Razorpay payment system to production using free hosting services.

## 📋 Prerequisites

### 1. **MongoDB Atlas Account** (Free Database)
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free account
- Create a free M0 cluster
- Get your connection string

### 2. **Razorpay Live Keys**
- Login to https://dashboard.razorpay.com
- Switch to Live Mode
- Get your Live Key ID and Secret from Settings → API Keys

### 3. **Gmail App Password**
- Go to https://myaccount.google.com/security
- Enable 2-Step Verification
- Generate App Password: Security → 2-Step Verification → App passwords
- Save the 16-character password

---

## 🔥 Option 1: Deploy to Render.com (Recommended - Free)

### Step 1: Prepare Your Code
1. Create a GitHub repository
2. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/shopify-guide.git
git push -u origin main
```

### Step 2: Deploy to Render
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: shopify-video-guide
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server-production.js`
   - **Plan**: Free

### Step 3: Add Environment Variables
In Render dashboard, go to Environment tab and add:
```
NODE_ENV=production
BASE_URL=https://shopify-video-guide.onrender.com
MONGODB_URI=your_mongodb_connection_string
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
GUIDE_JWT_SECRET=generate-random-64-chars
SESSION_SECRET=generate-another-64-chars
COURSE_PRICE=599
```

### Step 4: Deploy
Click "Create Web Service" and wait for deployment (5-10 minutes)

Your app will be live at: `https://shopify-video-guide.onrender.com`

---

## 🚂 Option 2: Deploy to Railway (Alternative - Free Trial)

### Step 1: Setup Railway
1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"

### Step 2: Configure
1. Select your repository
2. Railway will auto-detect Node.js
3. Add environment variables in Settings → Variables

### Step 3: Deploy
Railway will automatically deploy. Get your URL from Settings.

---

## ☁️ Option 3: Deploy to Cyclic.sh (Simple & Free)

### Step 1: Deploy
1. Go to https://www.cyclic.sh
2. Sign in with GitHub
3. Click "Deploy" and select your repo

### Step 2: Configure
Add environment variables in the Cyclic dashboard.

### Step 3: Access
Your app will be at: `https://your-app.cyclic.app`

---

## 🔧 Post-Deployment Setup

### 1. Update Razorpay Webhook (Optional but Recommended)
In Razorpay Dashboard:
- Go to Settings → Webhooks
- Add webhook URL: `https://your-app.onrender.com/api/webhook`
- Select events: payment.captured, order.paid

### 2. Test Your Deployment
1. Visit your deployed URL
2. Test with Razorpay Test Mode first
3. Make a test payment
4. Verify email is received
5. Check guide access works

### 3. Switch to Production
1. Update Razorpay keys to Live mode
2. Test with a real payment (small amount)
3. Verify everything works

---

## 📱 Custom Domain (Optional)

### Free Options:
1. **Render.com**: Supports custom domains for free
2. **Cloudflare Pages**: Free SSL and CDN

### Setup Custom Domain:
1. Buy domain from Namecheap/GoDaddy ($10/year)
2. In Render: Settings → Custom Domains
3. Add your domain
4. Update DNS records as instructed

---

## 🛡️ Security Checklist

- [x] Use environment variables (never commit secrets)
- [x] Enable HTTPS (automatic on all platforms)
- [x] Use production Razorpay keys
- [x] Set strong JWT secrets
- [x] Configure CORS properly
- [x] Use MongoDB Atlas with IP whitelist
- [x] Enable 2FA on all accounts

---

## 🐛 Troubleshooting

### Issue: "Application Error" on Render
- Check logs: Dashboard → Logs
- Verify all environment variables are set
- Check MongoDB connection string

### Issue: Emails not sending
- Verify Gmail App Password is correct
- Check Gmail account isn't blocking "less secure apps"
- Try with SendGrid as alternative (free tier available)

### Issue: Payment not working
- Ensure Razorpay Live keys are correct
- Check if your Razorpay account is fully activated
- Verify webhook secret if using webhooks

### Issue: Guide access not working
- Check JWT secret matches in all places
- Verify MongoDB is connected
- Check browser console for errors

---

## 📊 Monitoring

### Free Monitoring Services:
1. **UptimeRobot**: https://uptimerobot.com (free tier)
   - Monitors if your site is up
   - Sends alerts if down

2. **LogDNA/Datadog**: Free tiers available
   - Application monitoring
   - Error tracking

---

## 💰 Costs

### Completely Free Setup:
- **Hosting**: Render.com (free tier)
- **Database**: MongoDB Atlas M0 (free)
- **Email**: Gmail (free)
- **Payment**: Razorpay (2% transaction fee only)

### Optional Paid:
- **Custom Domain**: ~$10/year
- **Better Email**: SendGrid ($0-15/month)
- **Premium Hosting**: ~$7/month for better performance

---

## 🎯 Quick Deploy Commands

```bash
# 1. Prepare for deployment
npm install --production
git add .
git commit -m "Ready for production"
git push origin main

# 2. Test locally with production settings
NODE_ENV=production node server-production.js

# 3. View logs on Render
render logs --tail

# 4. Force redeploy
git commit --allow-empty -m "Force deploy"
git push origin main
```

---

## 📞 Support

If you face any issues:
1. Check the logs first
2. Verify environment variables
3. Test locally with production settings
4. Contact support@render.com for hosting issues
5. Check Razorpay documentation for payment issues

---

## ✅ Final Checklist

Before going live:
- [ ] All environment variables set correctly
- [ ] MongoDB Atlas cluster created and connected
- [ ] Razorpay Live keys configured
- [ ] Gmail App Password working
- [ ] Test payment completed successfully
- [ ] Guide access verified
- [ ] Custom domain configured (optional)
- [ ] Monitoring setup (optional)

**Your app is now ready for production! 🎉**
