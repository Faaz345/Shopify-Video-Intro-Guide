require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

console.log('🔍 Email System Diagnosis & Testing Tool');
console.log('==========================================\n');

// Email configuration (same as server)
const emailConfigs = {
    gmail: {
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER || 'code.commerce999@gmail.com',
            pass: process.env.GMAIL_APP_PASSWORD
        }
    }
};

// Test customer email (change this to test different emails)
const TEST_CUSTOMER_EMAIL = 'code.commerce999@gmail.com'; // Change this to test with different email

// Mock payment details for testing
const mockPaymentDetails = {
    payment_id: 'pay_test_' + crypto.randomBytes(8).toString('hex'),
    order_id: 'order_test_' + crypto.randomBytes(8).toString('hex')
};

// Mock course content (same as server)
const courseContent = {
    title: 'Shopify Video Intro Guide - Liquid Programming Tutorial',
    price: 599
};

// Generate secure access token (same logic as server)
function generateSecureToken() {
    return crypto.randomBytes(32).toString('hex') + '_' + Date.now();
}

// Create course access (simplified version)
function createCourseAccess(email, paymentDetails) {
    const accessToken = generateSecureToken();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 365); // 1 year access
    
    return {
        accessToken,
        courseUrl: `https://shopify-intro-guide.vercel.app/?token=${accessToken}&email=${encodeURIComponent(email)}`,
        expiryDate
    };
}

// Send course access email (same as server function)
async function sendCourseAccess(email, paymentDetails) {
    console.log(`🔄 Preparing to send course access email to: ${email}`);
    
    // Create transporter
    let transporter;
    try {
        transporter = nodemailer.createTransport(emailConfigs.gmail);
        console.log('✅ Gmail transporter created successfully');
    } catch (error) {
        console.error('❌ Failed to create transporter:', error.message);
        return false;
    }

    // Verify transporter
    try {
        await transporter.verify();
        console.log('✅ Gmail connection verified');
    } catch (error) {
        console.error('❌ Gmail verification failed:', error.message);
        return false;
    }

    // Create secure access
    const courseAccess = createCourseAccess(email, paymentDetails);
    console.log(`🎟️ Generated access token: ${courseAccess.accessToken.substring(0, 16)}...`);
    console.log(`🔗 Course URL: ${courseAccess.courseUrl.substring(0, 80)}...`);

    // Email content
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: '🎉 Your Secure Access to Shopify Video Intro Guide - TEST EMAIL',
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px; border-radius: 10px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #2c3e50; margin-bottom: 10px;">🎬 Shopify Video Intro Guide</h1>
                <p style="color: #7f8c8d; font-size: 16px;">Liquid Programming Tutorial</p>
                <div style="background: #e74c3c; color: white; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <strong>⚠️ THIS IS A TEST EMAIL ⚠️</strong>
                </div>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
                <h2 style="color: #27ae60;">✅ Payment Confirmed!</h2>
                <p>Hi there!</p>
                <p>This is a <strong>TEST</strong> of the course delivery system.</p>
                
                <div style="background: #ecf0f1; padding: 15px; border-radius: 5px; margin: 20px 0;">
                    <strong>Test Payment Details:</strong><br>
                    Payment ID: ${paymentDetails.payment_id}<br>
                    Order ID: ${paymentDetails.order_id}<br>
                    Amount: ₹${courseContent.price}
                </div>
            </div>
            
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
                <h2 style="color: white; margin-bottom: 20px;">🔐 Your Secure Course Access</h2>
                <p style="color: #f8f9fa; margin-bottom: 25px;">Click the button below to access your complete course:</p>
                
                <a href="${courseAccess.courseUrl}" style="display: inline-block; background: #00ff88; color: #2c3e50; padding: 15px 30px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 18px; margin: 10px 0;">🚀 Access Course Now (TEST)</a>
                
                <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
                    <p style="color: #f8f9fa; font-size: 14px; margin: 5px 0;">📅 Access expires: ${courseAccess.expiryDate.toLocaleDateString()}</p>
                    <p style="color: #f8f9fa; font-size: 14px; margin: 5px 0;">🔢 Access limit: 50 visits</p>
                    <p style="color: #f8f9fa; font-size: 12px; margin: 10px 0;">⚠️ This is a TEST link</p>
                </div>
            </div>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #856404; margin-bottom: 10px;">🧪 Test Information</h3>
                <p style="color: #856404; font-size: 14px; line-height: 1.6;">
                    This is a test email to verify the course delivery system is working correctly.<br>
                    Test sent at: ${new Date().toISOString()}<br>
                    System: Email Debugging Tool
                </p>
            </div>
            
            <div style="background: #2c3e50; color: white; padding: 20px; border-radius: 8px; text-align: center;">
                <h3>🛠 Email System Test</h3>
                <p>If you received this email, the system is working correctly!</p>
                <p><strong>Support:</strong> code.commerce999@gmail.com</p>
            </div>
        </div>
        `
    };

    // Send email
    try {
        console.log(`📤 Sending test email to: ${email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully!');
        console.log(`📬 Message ID: ${info.messageId}`);
        console.log(`📧 Recipient: ${email}`);
        console.log(`🎯 Subject: ${mailOptions.subject}`);
        console.log(`📊 Response: ${JSON.stringify(info.response || 'No response data', null, 2)}`);
        return true;
    } catch (error) {
        console.error('❌ Email sending failed:', error);
        console.error('Error details:', {
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        return false;
    }
}

// Main testing function
async function runEmailSystemTest() {
    console.log('📋 Email Configuration Check:');
    console.log(`   Gmail User: ${process.env.GMAIL_USER}`);
    console.log(`   Gmail App Password: ${process.env.GMAIL_APP_PASSWORD ? '✅ Set (' + process.env.GMAIL_APP_PASSWORD.length + ' chars)' : '❌ Not set'}`);
    console.log(`   Test Email: ${TEST_CUSTOMER_EMAIL}`);
    console.log();

    console.log('🧪 Running Course Email Delivery Test...');
    console.log('=======================================\n');

    const success = await sendCourseAccess(TEST_CUSTOMER_EMAIL, mockPaymentDetails);

    console.log('\n📊 Test Results:');
    console.log('================');
    if (success) {
        console.log('✅ EMAIL SYSTEM WORKING CORRECTLY!');
        console.log('📧 Check your inbox:', TEST_CUSTOMER_EMAIL);
        console.log('📝 If you didn\'t receive the email, check:');
        console.log('   1. Spam/Junk folder');
        console.log('   2. Gmail filters or blocking');
        console.log('   3. Email client delays (can take up to 5 minutes)');
    } else {
        console.log('❌ EMAIL SYSTEM HAS ISSUES');
        console.log('🔧 Check the error messages above');
        console.log('💡 Common fixes:');
        console.log('   1. Verify Gmail App Password is correct');
        console.log('   2. Check if 2FA is enabled on Gmail');
        console.log('   3. Verify Gmail account security settings');
    }
}

// Additional diagnostic functions
async function checkGmailLimits() {
    console.log('\n📊 Gmail Sending Limits Check:');
    console.log('==============================');
    console.log('📤 Gmail limits:');
    console.log('   - Personal Gmail: 500 emails/day');
    console.log('   - Gmail Workspace: 2000 emails/day');
    console.log('   - Rate limit: ~100 emails/hour');
    console.log();
}

// Run the test
async function main() {
    try {
        await runEmailSystemTest();
        await checkGmailLimits();
        
        console.log('\n🎯 Next Steps:');
        console.log('==============');
        console.log('1. If test email works, the system is ready');
        console.log('2. Test with a real purchase to verify end-to-end flow');
        console.log('3. Monitor server logs during actual payments');
        console.log('4. Check customer spam folders if they report not receiving emails');
        
    } catch (error) {
        console.error('🚨 Unexpected error during testing:', error);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    sendCourseAccess,
    createCourseAccess,
    runEmailSystemTest
};
