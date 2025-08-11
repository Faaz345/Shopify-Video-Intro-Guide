# 🔧 Render Deployment Troubleshooting Guide

## ❌ Error: "key_id or oauthToken is mandatory"

### Problem
The Razorpay SDK is throwing an error because it cannot find the required API credentials.

### Solution

#### 1. Check Environment Variables in Render Dashboard

Go to your Render service → **Environment** tab and verify you have added:

```env
RAZORPAY_KEY_ID=rzp_test_svuJcv020PyvU9
RAZORPAY_KEY_SECRET=s5ffeTjwaDB0MSbBm6yZvjoN
```

**Important:** 
- NO quotes around the values
- NO spaces before or after the = sign
- Make sure there are no hidden characters

#### 2. Verify Environment Variables Are Set

After deployment, check if variables are loaded:
1. Visit: `https://your-app.onrender.com/api/env-status`
2. Look for Razorpay section - should show ✅ for both

#### 3. If Variables Still Not Loading

Sometimes Render needs a manual restart:
1. Go to Render Dashboard
2. Click on your service
3. Click **Manual Deploy** → **Deploy latest commit**
4. OR click **Restart Service**

---

## 📝 Complete Environment Variables Checklist

Make sure ALL these are set in Render (Environment tab):

```env
# Server Configuration
NODE_ENV=production
PORT=10000
BASE_URL=https://shopify-video-guide.onrender.com

# MongoDB (from MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/shopify-guide?retryWrites=true&w=majority

# Razorpay (START WITH TEST KEYS)
RAZORPAY_KEY_ID=rzp_test_svuJcv020PyvU9
RAZORPAY_KEY_SECRET=s5ffeTjwaDB0MSbBm6yZvjoN

# Email (from Gmail)
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-password

# Security (generate random strings)
GUIDE_JWT_SECRET=your-random-64-character-string-here
SESSION_SECRET=another-random-64-character-string-here

# Course Settings
COURSE_PRICE=599
ALLOWED_ORIGINS=https://shopify-video-guide.onrender.com
```

---

## 🔍 Debug Steps

### Step 1: Check Service Logs
1. Go to Render Dashboard
2. Click on your service
3. Click **Logs** tab
4. Look for error messages

### Step 2: Test Health Endpoint
```
https://your-app.onrender.com/health
```
Should return:
```json
{
  "status": "ok",
  "environment": "production",
  "port": 10000
}
```

### Step 3: Check Environment Status
```
https://your-app.onrender.com/api/env-status
```
This will show which environment variables are set or missing.

---

## 🚨 Common Issues and Fixes

### Issue 1: "Cannot find module"
**Fix:** Make sure all dependencies are in package.json, not devDependencies

### Issue 2: "Port is already in use"
**Fix:** Use PORT environment variable (Render sets this automatically)

### Issue 3: "MongoDB connection failed"
**Fix:** 
- Check MongoDB Atlas Network Access has 0.0.0.0/0
- Verify connection string is correct
- No quotes around MONGODB_URI value

### Issue 4: "Email not sending"
**Fix:**
- Verify Gmail App Password is correct
- Check that 2-Step Verification is enabled on Gmail
- No quotes around email credentials

### Issue 5: "Build failed"
**Fix:**
- Check Build Command is: `npm install`
- Check Start Command is: `npm start`
- Make sure Node version is compatible

---

## 🎯 Quick Fix for Razorpay Error

If you're getting the Razorpay error after following all steps:

1. **Add Test Keys First** (to get it working):
   ```
   RAZORPAY_KEY_ID=rzp_test_svuJcv020PyvU9
   RAZORPAY_KEY_SECRET=s5ffeTjwaDB0MSbBm6yZvjoN
   ```

2. **Redeploy**:
   - Click "Manual Deploy" → "Deploy latest commit"

3. **Verify it works**:
   - Visit: `/api/env-status`
   - Check Razorpay shows ✅

4. **Then switch to Live Keys** (when ready):
   ```
   RAZORPAY_KEY_ID=rzp_live_YOUR_KEY
   RAZORPAY_KEY_SECRET=YOUR_SECRET
   ```

---

## 📊 Environment Variable Format Examples

### ✅ CORRECT Format:
```
RAZORPAY_KEY_ID=rzp_test_svuJcv020PyvU9
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
```

### ❌ WRONG Format:
```
RAZORPAY_KEY_ID="rzp_test_svuJcv020PyvU9"  # No quotes!
RAZORPAY_KEY_ID= rzp_test_svuJcv020PyvU9   # No spaces!
MONGODB_URI='mongodb+srv://...'            # No quotes!
```

---

## 🔄 Force Redeploy

If changes aren't taking effect:

1. Make a small change to force redeploy:
   ```bash
   git commit --allow-empty -m "Force redeploy"
   git push origin main
   ```

2. Or in Render Dashboard:
   - Settings → Delete Service
   - Create new service with same settings

---

## 📞 Support Links

- **Render Status**: https://status.render.com
- **Render Docs**: https://render.com/docs
- **Community Forum**: https://community.render.com

---

## ✅ Success Checklist

Your deployment is working when:
- [ ] `/health` returns ok
- [ ] `/api/env-status` shows all variables set
- [ ] No errors in Render logs
- [ ] Payment page loads
- [ ] Can create test payment

---

## 🆘 Emergency Fix

If nothing else works, the updated code now has fallbacks:
1. Server won't crash if Razorpay keys missing (in development)
2. Will show clear error messages in logs
3. `/api/env-status` endpoint helps debug

The code has been updated to handle missing environment variables more gracefully!
