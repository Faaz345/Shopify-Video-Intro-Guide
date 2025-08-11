# 📧 Complete Gmail Setup Guide for Course Email Delivery

This guide will help you set up Gmail to automatically send course access emails when customers make payments.

## 🔧 **Step-by-Step Setup**

### **Step 1: Enable 2-Factor Authentication**

1. **Open Google Account Settings**
   - Go to: https://myaccount.google.com/
   - Click on **"Security"** in the left sidebar

2. **Enable 2-Step Verification**
   - Find **"2-Step Verification"** 
   - Click **"Get started"**
   - Follow the setup process (you'll need your phone)
   - **Complete the verification process**

⚠️ **Important**: You MUST enable 2-Step Verification before you can create App Passwords!

### **Step 2: Generate Gmail App Password**

1. **Go back to Security Settings**
   - Visit: https://myaccount.google.com/security
   - Look for **"App passwords"** (only appears after 2-Step is enabled)

2. **Create App Password**
   - Click **"App passwords"**
   - **Select app**: Choose **"Mail"**
   - **Select device**: Choose **"Other (custom name)"**
   - **Enter name**: Type `Shopify Course Server`
   - Click **"Generate"**

3. **Copy the Password**
   - Google will show a 16-character password like: `abcd efgh ijkl mnop`
   - **Copy this password** (you'll need it for the next step)
   - ⚠️ **This is NOT your regular Gmail password!**

### **Step 3: Update Environment Variables**

1. **Edit the .env file**
   - Open `.env` file in your project folder
   - Update these two lines:

```env
# Your Gmail address
GMAIL_USER=your-actual-email@gmail.com

# Your Gmail App Password (the 16-character password from Step 2)
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
```

2. **Replace the values**:
   - `your-actual-email@gmail.com` → Your actual Gmail address
   - `abcd efgh ijkl mnop` → The 16-character App Password from Step 2

### **Step 4: Test Gmail Configuration**

1. **Run the Test Script**
   ```bash
   node test-gmail.js
   ```

2. **Expected Output**
   ```
   🔧 Testing Gmail Configuration...
   📧 Testing with email: your-email@gmail.com
   🔑 App password length: 16 characters
   🔄 Verifying Gmail connection...
   ✅ Gmail connection successful!
   📤 Sending test email...
   ✅ Test email sent successfully!
   📬 Message ID: <message-id>
   📧 Check your inbox: your-email@gmail.com
   🎉 Gmail Setup Complete!
   ```

3. **Check Your Email**
   - Look for the test email in your inbox
   - If you see it, Gmail is working perfectly!

### **Step 5: Start Your Server**

```bash
node server-shopify.js
```

You should see:
```
✅ Email service initialized: Gmail
📧 Using Gmail account: your-email@gmail.com
🚀 Shopify Video Intro Guide server running on port 3000
```

## 🚨 **Troubleshooting**

### **Problem: "App passwords" option not showing**
- **Solution**: Make sure 2-Step Verification is enabled first
- Go to https://myaccount.google.com/security
- Enable 2-Step Verification, then try again

### **Problem: EAUTH authentication error**
- **Solution**: Double-check your App Password
- Make sure you're using the 16-character App Password, not your regular Gmail password
- Generate a new App Password if needed

### **Problem: GMAIL_APP_PASSWORD not set**
- **Solution**: Check your .env file
- Make sure there are no extra spaces
- The format should be: `GMAIL_APP_PASSWORD=your_app_password_here`

### **Problem: Connection timeout**
- **Solution**: Check your internet connection
- Try again in a few minutes
- Make sure Gmail is accessible from your network

## 📋 **Complete .env File Example**

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_svuJcv020PyvU9
RAZORPAY_KEY_SECRET=s5ffeTjwaDB0MSbBm6yZvjoN

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/razorpay-secure

# JWT Configuration
JWT_SECRET=my_super_secret_jwt_key_for_development_2024
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:5000

# Payment Amount (in paise - 100 paise = 1 INR)
PAYMENT_AMOUNT=99900

# Gmail Configuration for Course Email Delivery
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your_16_character_app_password
```

## 🔐 **Security Best Practices**

1. **Keep App Password Secret**
   - Never share your App Password
   - Don't commit it to version control
   - Store it securely in your .env file

2. **Use App Passwords Only**
   - Never use your regular Gmail password in applications
   - App Passwords are safer and can be revoked independently

3. **Monitor Usage**
   - Check your Gmail "Recent security activity" occasionally
   - Revoke App Passwords you're not using

## ✅ **What Happens After Setup**

Once Gmail is configured:

1. **Automatic Email Delivery**: When customers complete payment, they automatically receive a professional email with their course access link

2. **Secure Course Access**: Each email contains a unique, secure access token that only works for that customer

3. **Professional Appearance**: Emails are beautifully formatted with your branding and clear instructions

4. **Delivery Confirmation**: You'll see successful email delivery in your server logs

## 📞 **Need Help?**

If you're still having trouble:

1. **Run the Test Script**: `node test-gmail.js`
2. **Check the Error Messages**: The script provides detailed troubleshooting steps
3. **Verify Your Setup**: Make sure 2-Step Verification is enabled
4. **Generate New App Password**: If in doubt, create a fresh App Password

The system will work perfectly once Gmail is properly configured! 🎉
