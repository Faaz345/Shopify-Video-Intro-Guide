// Gmail Configuration Test Script
// Run this to verify your Gmail setup is working correctly

require('dotenv').config();
const nodemailer = require('nodemailer');

async function testGmailSetup() {
    console.log('🔧 Testing Gmail Configuration...\n');
    
    // Check environment variables
    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    
    if (!gmailUser) {
        console.error('❌ GMAIL_USER not set in .env file');
        return;
    }
    
    if (!gmailPassword || gmailPassword === 'your_app_password_here') {
        console.error('❌ GMAIL_APP_PASSWORD not set properly in .env file');
        console.log('📋 Please follow these steps:');
        console.log('   1. Go to https://myaccount.google.com/security');
        console.log('   2. Enable 2-Step Verification');
        console.log('   3. Generate an App Password');
        console.log('   4. Update GMAIL_APP_PASSWORD in .env file');
        return;
    }
    
    console.log(`📧 Testing with email: ${gmailUser}`);
    console.log(`🔑 App password length: ${gmailPassword.length} characters`);
    
    // Create transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailPassword
        }
    });
    
    try {
        // Test connection
        console.log('🔄 Verifying Gmail connection...');
        await transporter.verify();
        console.log('✅ Gmail connection successful!\n');
        
        // Send test email
        console.log('📤 Sending test email...');
        const testEmail = {
            from: gmailUser,
            to: gmailUser, // Send to yourself for testing
            subject: '🧪 Gmail Test - Shopify Course System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4CAF50;">✅ Gmail Setup Successful!</h1>
                    </div>
                    
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h2 style="color: #333;">🎉 Congratulations!</h2>
                        <p>Your Gmail configuration is working correctly for the Shopify Course System.</p>
                    </div>
                    
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #1976d2;">📊 Test Details</h3>
                        <p><strong>From:</strong> ${gmailUser}</p>
                        <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
                        <p><strong>System:</strong> Shopify Video Intro Course</p>
                    </div>
                    
                    <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <h3 style="color: #f57c00;">🔧 Next Steps</h3>
                        <ol style="line-height: 1.6;">
                            <li>Gmail is configured and working ✅</li>
                            <li>Course emails will now be delivered automatically</li>
                            <li>Payment confirmations will include secure course access links</li>
                            <li>You can start processing real orders</li>
                        </ol>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="color: #666; font-size: 14px;">
                            This is an automated test email from your Shopify Course System<br>
                            If you received this, your Gmail setup is working perfectly!
                        </p>
                    </div>
                </div>
            `
        };
        
        const info = await transporter.sendMail(testEmail);
        
        console.log('✅ Test email sent successfully!');
        console.log(`📬 Message ID: ${info.messageId}`);
        console.log(`📧 Check your inbox: ${gmailUser}\n`);
        
        console.log('🎉 Gmail Setup Complete!');
        console.log('Your server is now ready to send course access emails.');
        
    } catch (error) {
        console.error('❌ Gmail setup failed:');
        console.error(`Error: ${error.message}\n`);
        
        if (error.code === 'EAUTH') {
            console.log('🔧 Authentication Error - Common Solutions:');
            console.log('   1. Make sure you\'re using an App Password, not your regular Gmail password');
            console.log('   2. Enable 2-Step Verification first');
            console.log('   3. Generate a new App Password from Google Account settings');
            console.log('   4. Make sure GMAIL_USER and GMAIL_APP_PASSWORD are correct in .env');
        } else if (error.code === 'ECONNECTION') {
            console.log('🌐 Connection Error:');
            console.log('   1. Check your internet connection');
            console.log('   2. Try again in a few moments');
            console.log('   3. Check if Gmail is accessible from your network');
        } else {
            console.log('💡 Troubleshooting:');
            console.log('   1. Double-check your .env file configuration');
            console.log('   2. Make sure the App Password is exactly 16 characters');
            console.log('   3. Try generating a new App Password');
        }
    }
}

// Run the test
testGmailSetup().catch(console.error);
