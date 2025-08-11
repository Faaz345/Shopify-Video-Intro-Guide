# 🎬 Shopify Video Intro Guide - Complete Setup Instructions

This system is now configured to sell your **Shopify Liquid programming tutorial** that teaches users how to add cinematic video intros to their stores. Here's everything you need to know:

## 🚀 What's Built For You

### ✅ Complete Landing Page
- Professional design showcasing your Liquid programming expertise
- Code previews and feature explanations
- Responsive mobile design
- Testimonials and FAQ section

### ✅ Full Payment Integration
- **UPI payments** (PhonePe, Google Pay, Paytm)
- Credit/Debit cards
- Net banking & wallets
- Secure Razorpay integration

### ✅ Automatic Course Delivery
- Email delivery with all course files
- Professional email templates
- Instant delivery after payment verification

### ✅ Course Content Included
1. **video-intro.liquid** - Complete snippet code
2. **settings_schema.json** - Theme configuration
3. **theme-integration.liquid** - Integration code
4. **Implementation-Guide.md** - Step-by-step instructions

---

## 🛠️ Quick Setup (5 Minutes!)

### Step 1: Replace Your Razorpay Keys

In `server-shopify.js`, find line 25 and update:

```javascript
// REPLACE THESE WITH YOUR ACTUAL KEYS
const razorpay = new Razorpay({
    key_id: 'rzp_test_your_key_id',     // 👈 Your Razorpay Key ID here
    key_secret: 'your_key_secret'        // 👈 Your Razorpay Secret here
});
```

**Get your keys from:** [Razorpay Dashboard](https://dashboard.razorpay.com/) → Settings → API Keys

### Step 2: Configure Email Delivery

In `server-shopify.js`, find line 30 and update:

```javascript
// REPLACE WITH YOUR EMAIL CREDENTIALS
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: 'code.commerce999@gmail.com',    // 👈 Your Gmail here
        pass: 'your-app-password'              // 👈 Your Gmail App Password here
    }
});
```

**To get Gmail App Password:**
1. Enable 2-factor authentication on your Gmail
2. Go to Google Account → Security → 2-Step Verification → App passwords
3. Generate password for "Mail"

### Step 3: Install & Run

```bash
# Install dependencies (if not already installed)
npm install

# Start the server
npm start
```

Your site will be live at `http://localhost:3000`

---

## 💳 Razorpay Setup Guide

### For Testing (Start Here):
1. **Sign up:** [Razorpay Test Account](https://dashboard.razorpay.com/)
2. **Get Test Keys:** Dashboard → Settings → API Keys → Test Keys
3. **Test Cards:** Use `4111 1111 1111 1111` (any CVV/expiry)

### For Live Payments:
1. **Complete KYC:** Upload business documents
2. **Get Live Keys:** After approval, generate live API keys
3. **Go Live:** Replace test keys with live keys

---

## 🎯 Your Course Content System

### What Customers Get:
When someone pays ₹599, they automatically receive:

1. **Complete Liquid Code** - Ready-to-use video intro snippet
2. **Theme Settings** - JSON configuration for easy customization  
3. **Integration Guide** - Step-by-step Shopify implementation
4. **Mobile Optimization** - Responsive code for all devices

### Customizing Course Content:
In `server-shopify.js`, find the `courseContent` object (around line 40) to:
- Update course title
- Change price (currently ₹599)
- Modify file contents
- Add more files

### Email Template:
The email template is in the `sendCourseContent` function - customize the design and messaging.

---

## 📧 Testing Your System

### Test the Complete Flow:
1. **Start server:** `npm start`
2. **Open:** `http://localhost:3000`
3. **Click:** "Secure Access Now"
4. **Enter:** Test email address
5. **Pay:** Use test card `4111 1111 1111 1111`
6. **Check:** Email for course content

### Test UPI Payments:
- Use UPI ID: `success@razorpay` for testing
- Or use actual UPI apps in test mode

---

## 🌐 Going Live

### Option 1: Quick Deploy (Recommended)
1. **Heroku/Railway:** Push your code
2. **Set Environment Variables:**
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `EMAIL_USER`
   - `EMAIL_PASS`
3. **Update Keys:** Replace test with live keys

### Option 2: VPS Deployment
1. **DigitalOcean/AWS:** Get a server
2. **Install Node.js:** `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -`
3. **Upload Code:** Git clone or FTP
4. **Start with PM2:** `pm2 start server-shopify.js`

---

## 💰 Pricing & Payments

### Current Setup:
- **Price:** ₹599 (modify in `courseContent.price`)
- **Currency:** INR (Indian Rupees)
- **Methods:** UPI, Cards, Net Banking, Wallets

### Supported Payment Methods:
- ✅ **UPI:** PhonePe, Google Pay, Paytm, BHIM
- ✅ **Cards:** Visa, MasterCard, RuPay
- ✅ **Banking:** All major Indian banks
- ✅ **Wallets:** Paytm, PhonePe, Amazon Pay

---

## 🔧 Customization Options

### Landing Page Updates:
- Edit `public/index.html`
- Update testimonials, pricing, features
- Change colors in CSS variables

### Course Content Updates:
- Modify files in `courseContent` object
- Add new tutorial files
- Update implementation guides

### Email Templates:
- Customize email design in `sendCourseContent` function
- Add your branding and styling

---

## 📊 What Happens After Payment

1. **Payment Verification:** Razorpay signature validated
2. **Email Sent:** Course content delivered instantly  
3. **Success Page:** Customer redirected to thank you page
4. **Support Ready:** Your email address provided for help

---

## 🆘 Troubleshooting

### Payment Not Working:
- ✅ Check Razorpay keys are correct
- ✅ Verify you're using test mode initially  
- ✅ Check browser console for errors

### Email Not Sending:
- ✅ Verify Gmail App Password (not your regular password!)
- ✅ Enable 2-factor authentication first
- ✅ Check email credentials in server file

### Course Not Delivered:
- ✅ Check server console for error messages
- ✅ Test email configuration separately
- ✅ Verify course content files are properly formatted

---

## 🎉 You're Ready to Launch!

Your **Shopify Video Intro Guide** system is complete with:

- ✅ Professional landing page
- ✅ Secure payment processing  
- ✅ UPI & all payment methods
- ✅ Automatic course delivery
- ✅ Complete Liquid tutorial content
- ✅ Mobile-responsive design
- ✅ Email support system

### Final Checklist:
- [ ] Razorpay keys updated
- [ ] Gmail app password configured
- [ ] Test payment completed successfully
- [ ] Course email received and verified
- [ ] Ready to share your course with the world!

---

## 📞 Support

**Your Support Email:** code.commerce999@gmail.com  
**Response Time:** Within 24 hours

**Quick Help:**
- Payment issues → Check Razorpay dashboard
- Email issues → Verify Gmail app password  
- Content issues → Check server console logs

---

**🚀 Created with ❤️ for your Shopify tutorial business!**

*Now go share your amazing Liquid programming knowledge with the world!* 🎯
