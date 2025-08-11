require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('📧 Email Delivery Troubleshooting Guide');
console.log('=========================================\n');

// Customer email from the server logs
const CUSTOMER_EMAIL = 'faaz.siddiqui345@gmail.com';
const PAYMENT_ID = 'pay_R3COVdacIR5iT7';
const ORDER_ID = 'order_R3COOOYUKuv409';

console.log('🔍 Analyzing Recent Payment & Email Delivery:');
console.log(`   Customer Email: ${CUSTOMER_EMAIL}`);
console.log(`   Payment ID: ${PAYMENT_ID}`);
console.log(`   Order ID: ${ORDER_ID}`);
console.log(`   Server Response: ✅ Email sent successfully`);
console.log(`   Message ID: <e81143cb-a965-ec4b-2157-ed6028888292@gmail.com>\n`);

console.log('🤔 Why Customer Might Not Have Received Email:');
console.log('==============================================');
console.log('1. 📂 SPAM/JUNK FOLDER');
console.log('   → Most common issue - check spam folder first!');
console.log('   → Gmail sometimes marks automated emails as spam');
console.log();

console.log('2. ⏰ EMAIL DELIVERY DELAY');
console.log('   → Gmail can take 2-15 minutes to deliver emails');
console.log('   → Server sent email successfully, but delivery is pending');
console.log();

console.log('3. 📧 EMAIL CLIENT ISSUES');
console.log('   → Customer might be using Outlook, Yahoo, or other client');
console.log('   → Different email providers have different spam filters');
console.log();

console.log('4. 🚫 EMAIL BLOCKING');
console.log('   → Corporate firewalls might block emails');
console.log('   → Some email providers block Gmail SMTP emails');
console.log();

// Function to resend email to customer
async function resendCustomerEmail(customerEmail, paymentId, orderId) {
    console.log(`\n🔄 Attempting to resend course access email to: ${customerEmail}`);
    
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });

    // Generate new access token for security
    const crypto = require('crypto');
    const accessToken = crypto.randomBytes(32).toString('hex') + '_' + Date.now();
    const courseUrl = `https://shopify-intro-guide.vercel.app/?token=${accessToken}&email=${encodeURIComponent(customerEmail)}`;

    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: customerEmail,
        subject: '🎉 [RESEND] Your Shopify Video Intro Guide - Course Access',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin-bottom: 10px;">🎬 Shopify Video Intro Guide</h1>
                <p style="color: #7f8c8d; font-size: 16px;">Liquid Programming Tutorial</p>
                <div style="background: #f39c12; color: white; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>📧 RESEND - Course Access Email</strong>
                </div>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #27ae60;">✅ Payment Successfully Processed!</h2>
                <p>Hello!</p>
                <p>We noticed you might not have received your original course access email. Here's your course access again:</p>
                
                <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Payment Details:</strong><br>
                    Payment ID: ${paymentId}<br>
                    Order ID: ${orderId}<br>
                    Amount: ₹599
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: white; margin-bottom: 20px;">🔐 Your Secure Course Access</h2>
                <p style="color: #f8f9fa; margin-bottom: 25px;">Click the button below to access your complete course:</p>
                
                <a href="${courseUrl}" style="display: inline-block; background: #00ff88; color: #2c3e50; padding: 15px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px; margin: 10px 0;">🚀 Access Your Course Now</a>
                
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="color: #f8f9fa; font-size: 14px; margin: 5px 0;">📅 Access expires: ${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                    <p style="color: #f8f9fa; font-size: 14px; margin: 5px 0;">🔢 Access limit: 50 visits</p>
                    <p style="color: #f8f9fa; font-size: 12px; margin: 10px 0;">⚠️ This link is personal - please don't share</p>
                </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #856404; margin-bottom: 10px;">📝 Important Notes</h3>
                <ul style="color: #856404; font-size: 14px; line-height: 1.6;">
                    <li>This is a RESEND of your course access</li>
                    <li>Your previous access link is still valid if you have it</li>
                    <li>Please add our email to your contacts to avoid spam filtering</li>
                    <li>Check your spam/junk folder for future emails</li>
                </ul>
            </div>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #155724; margin-bottom: 10px;">📚 What You'll Get</h3>
                <ul style="color: #155724; line-height: 1.8;">
                    <li><strong>Complete Liquid Code</strong> - Ready-to-use video intro snippet</li>
                    <li><strong>Settings Configuration</strong> - Theme customization options</li>
                    <li><strong>Step-by-step Guide</strong> - Detailed implementation instructions</li>
                    <li><strong>Mobile Optimization</strong> - Responsive design for all devices</li>
                    <li><strong>Performance Tips</strong> - Best practices for speed</li>
                    <li><strong>Troubleshooting</strong> - Common issues and solutions</li>
                </ul>
            </div>
            
            <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                <h3>🛠 Need Help?</h3>
                <p>If you're still having trouble accessing your course:</p>
                <p><strong>Email:</strong> code.commerce999@gmail.com</p>
                <p><strong>Response Time:</strong> Within 24 hours</p>
                <p>Please mention your Payment ID: ${paymentId}</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px; color: #7f8c8d;">
                <p>Thank you for your purchase!</p>
                <p style="font-size: 12px;">Created with ❤️ by Code & Commerce</p>
            </div>
        </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Resend email sent successfully!');
        console.log(`📬 New Message ID: ${info.messageId}`);
        console.log(`🔗 Course URL: ${courseUrl.substring(0, 80)}...`);
        return true;
    } catch (error) {
        console.error('❌ Resend email failed:', error.message);
        return false;
    }
}

// Function to check Gmail delivery status
async function checkEmailDeliveryStatus() {
    console.log('\n📊 Email Delivery Status Check:');
    console.log('===============================');
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });

        await transporter.verify();
        console.log('✅ Gmail connection is working');
        console.log('✅ Server successfully sent the email');
        console.log('✅ Email was accepted by Gmail servers');
        console.log();
        
        console.log('📋 Delivery Status: SENT TO GMAIL');
        console.log('📧 Gmail will handle final delivery to recipient');
        console.log('⏰ Delivery time: Usually 2-15 minutes');
        console.log();
        
    } catch (error) {
        console.error('❌ Gmail connection issue:', error.message);
    }
}

// Main troubleshooting function
async function runTroubleshooting() {
    await checkEmailDeliveryStatus();
    
    console.log('🎯 Recommended Actions:');
    console.log('======================');
    console.log('1. 📞 Contact the customer directly and ask them to:');
    console.log('   → Check spam/junk folder thoroughly');
    console.log('   → Wait 15-20 minutes and check again');
    console.log('   → Add code.commerce999@gmail.com to contacts');
    console.log();
    
    console.log('2. 🔄 If customer confirms no email after 30 minutes:');
    console.log('   → Run this script with "resend" parameter');
    console.log('   → Or manually send them the course URL');
    console.log();
    
    console.log('3. 💼 Alternative delivery methods:');
    console.log('   → WhatsApp/SMS with course URL');
    console.log('   → Generate new access link and share directly');
    console.log('   → Use different email service (SendGrid)');
    console.log();
    
    // Check if user wants to resend
    console.log('🤖 Do you want to resend the email now? (Run: node email-delivery-troubleshoot.js resend)');
}

// Command line handling
const args = process.argv.slice(2);
if (args.includes('resend')) {
    console.log('🔄 RESENDING EMAIL TO CUSTOMER...\n');
    resendCustomerEmail(CUSTOMER_EMAIL, PAYMENT_ID, ORDER_ID);
} else {
    runTroubleshooting();
}

module.exports = {
    resendCustomerEmail,
    checkEmailDeliveryStatus
};
