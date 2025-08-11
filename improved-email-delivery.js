require('dotenv').config();
const nodemailer = require('nodemailer');
const crypto = require('crypto');

console.log('📧 Improved Email Delivery - Spam Prevention');
console.log('=============================================\n');

// Improved email configuration with better settings
const improvedEmailConfig = {
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
    },
    // Additional settings to improve deliverability
    secure: true,
    requireTLS: true,
    tls: {
        rejectUnauthorized: false
    }
};

// Function to create spam-resistant email content
function createSpamResistantEmail(customerEmail, paymentDetails) {
    const accessToken = crypto.randomBytes(32).toString('hex') + '_' + Date.now();
    const courseUrl = `https://shopify-intro-guide.vercel.app/?token=${accessToken}&email=${encodeURIComponent(customerEmail)}`;
    
    return {
        from: {
            name: 'Code & Commerce Support',
            address: process.env.GMAIL_USER
        },
        to: customerEmail,
        // Simple, professional subject line
        subject: 'Your Course Access - Order Confirmation',
        
        // Plain text version (important for spam filters)
        text: `
Hello!

Thank you for your purchase of the Shopify Video Intro Guide.

Your payment has been confirmed:
- Payment ID: ${paymentDetails.payment_id}
- Order ID: ${paymentDetails.order_id}
- Amount: ₹599

Access your course here: ${courseUrl}

This link will expire in 1 year and is limited to 50 visits.
Please bookmark this email for future reference.

What you'll receive:
• Complete Liquid code snippet
• Theme settings configuration
• Step-by-step implementation guide
• Mobile optimization code
• Performance tips and troubleshooting

Need help? Reply to this email or contact us at code.commerce999@gmail.com

Thank you for your business!

Code & Commerce Team
        `,
        
        // HTML version with minimal formatting
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            
            <div style="border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 30px;">
                <h2 style="color: #333333; margin: 0;">Order Confirmation</h2>
                <p style="color: #666666; margin: 5px 0;">Shopify Video Intro Guide</p>
            </div>
            
            <p style="color: #333333; line-height: 1.6;">Hello!</p>
            
            <p style="color: #333333; line-height: 1.6;">Thank you for your purchase. Your payment has been confirmed and your course access is ready.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 25px 0;">
                <h3 style="color: #333333; margin-top: 0;">Payment Details</h3>
                <p style="color: #666666; margin: 5px 0;">Payment ID: <strong>${paymentDetails.payment_id}</strong></p>
                <p style="color: #666666; margin: 5px 0;">Order ID: <strong>${paymentDetails.order_id}</strong></p>
                <p style="color: #666666; margin: 5px 0;">Amount: <strong>₹599</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${courseUrl}" style="background-color: #007cba; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Access Your Course</a>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;"><strong>Important:</strong> Please bookmark this email. Your course access expires in 1 year and is limited to 50 visits.</p>
            </div>
            
            <h3 style="color: #333333;">Course Contents:</h3>
            <ul style="color: #666666; line-height: 1.8;">
                <li>Complete Liquid code snippet</li>
                <li>Theme settings configuration</li>
                <li>Step-by-step implementation guide</li>
                <li>Mobile optimization code</li>
                <li>Performance tips and troubleshooting</li>
            </ul>
            
            <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666666; font-size: 14px;">Need help? Reply to this email or contact us at <a href="mailto:code.commerce999@gmail.com">code.commerce999@gmail.com</a></p>
                <p style="color: #666666; font-size: 14px;">Thank you for your business!</p>
                <p style="color: #666666; font-size: 12px; margin-top: 20px;">Code & Commerce Team</p>
            </div>
            
        </div>
        `
    };
}

// Function to send improved email
async function sendImprovedEmail(customerEmail, paymentDetails) {
    console.log(`📧 Preparing improved email for: ${customerEmail}`);
    
    try {
        const transporter = nodemailer.createTransport(improvedEmailConfig);
        
        // Verify connection
        await transporter.verify();
        console.log('✅ Gmail connection verified');
        
        // Create spam-resistant email
        const emailOptions = createSpamResistantEmail(customerEmail, paymentDetails);
        
        console.log('📋 Email Improvements Applied:');
        console.log('   ✅ Professional sender name');
        console.log('   ✅ Simple subject line (no emojis)');
        console.log('   ✅ Plain text version included');
        console.log('   ✅ Minimal HTML formatting');
        console.log('   ✅ Business-like content tone');
        console.log('   ✅ Clear call-to-action');
        console.log('   ✅ Professional footer\n');
        
        // Send email
        const info = await transporter.sendMail(emailOptions);
        
        console.log('✅ Improved email sent successfully!');
        console.log(`📬 Message ID: ${info.messageId}`);
        console.log(`📧 Subject: ${emailOptions.subject}`);
        console.log(`🎯 Spam Score: Likely LOWER (improved formatting)`);
        
        return {
            success: true,
            messageId: info.messageId,
            courseUrl: emailOptions.html.match(/https:\/\/shopify-intro-guide\.vercel\.app\/[^"]+/)[0]
        };
        
    } catch (error) {
        console.error('❌ Failed to send improved email:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Function to update server email template
function generateServerEmailTemplate(customerEmail, paymentDetails) {
    const accessToken = crypto.randomBytes(32).toString('hex') + '_' + Date.now();
    const courseUrl = `https://shopify-intro-guide.vercel.app/?token=${accessToken}&email=${encodeURIComponent(customerEmail)}`;
    
    return {
        from: {
            name: 'Code & Commerce Support',
            address: process.env.GMAIL_USER
        },
        to: customerEmail,
        subject: 'Your Course Access - Order Confirmation',
        text: `
Hello!

Thank you for your purchase of the Shopify Video Intro Guide.

Your payment has been confirmed:
- Payment ID: ${paymentDetails.payment_id}
- Order ID: ${paymentDetails.order_id}
- Amount: ₹599

Access your course here: ${courseUrl}

This link will expire in 1 year and is limited to 50 visits.
Please bookmark this email for future reference.

What you'll receive:
• Complete Liquid code snippet
• Theme settings configuration  
• Step-by-step implementation guide
• Mobile optimization code
• Performance tips and troubleshooting

Need help? Reply to this email or contact us at code.commerce999@gmail.com

Thank you for your business!

Code & Commerce Team
        `,
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
            
            <div style="border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; margin-bottom: 30px;">
                <h2 style="color: #333333; margin: 0;">Order Confirmation</h2>
                <p style="color: #666666; margin: 5px 0;">Shopify Video Intro Guide</p>
            </div>
            
            <p style="color: #333333; line-height: 1.6;">Hello!</p>
            
            <p style="color: #333333; line-height: 1.6;">Thank you for your purchase. Your payment has been confirmed and your course access is ready.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 25px 0;">
                <h3 style="color: #333333; margin-top: 0;">Payment Details</h3>
                <p style="color: #666666; margin: 5px 0;">Payment ID: <strong>${paymentDetails.payment_id}</strong></p>
                <p style="color: #666666; margin: 5px 0;">Order ID: <strong>${paymentDetails.order_id}</strong></p>
                <p style="color: #666666; margin: 5px 0;">Amount: <strong>₹599</strong></p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="${courseUrl}" style="background-color: #007cba; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; display: inline-block;">Access Your Course</a>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-size: 14px;"><strong>Important:</strong> Please bookmark this email. Your course access expires in 1 year and is limited to 50 visits.</p>
            </div>
            
            <h3 style="color: #333333;">Course Contents:</h3>
            <ul style="color: #666666; line-height: 1.8;">
                <li>Complete Liquid code snippet</li>
                <li>Theme settings configuration</li>
                <li>Step-by-step implementation guide</li>
                <li>Mobile optimization code</li>
                <li>Performance tips and troubleshooting</li>
            </ul>
            
            <div style="border-top: 1px solid #f0f0f0; padding-top: 20px; margin-top: 30px;">
                <p style="color: #666666; font-size: 14px;">Need help? Reply to this email or contact us at <a href="mailto:code.commerce999@gmail.com">code.commerce999@gmail.com</a></p>
                <p style="color: #666666; font-size: 14px;">Thank you for your business!</p>
                <p style="color: #666666; font-size: 12px; margin-top: 20px;">Code & Commerce Team</p>
            </div>
            
        </div>
        `
    };
}

// Additional tips for spam prevention
function showSpamPreventionTips() {
    console.log('\n🛡️ Spam Prevention Tips:');
    console.log('========================');
    console.log('1. 📧 Use professional sender name');
    console.log('2. 🎯 Avoid emoji-heavy subject lines');
    console.log('3. 📝 Include plain text version');
    console.log('4. 🎨 Use minimal HTML formatting');
    console.log('5. 🔗 Limit number of links');
    console.log('6. 💬 Use conversational, not marketing tone');
    console.log('7. 📞 Include contact information');
    console.log('8. 🏷️ Avoid spam trigger words');
    console.log();
    
    console.log('🚫 Avoid These Words:');
    console.log('   - "FREE", "URGENT", "LIMITED TIME"');
    console.log('   - "CONGRATULATIONS", "WINNER"');
    console.log('   - "CLICK HERE NOW", "ACT NOW"');
    console.log('   - Multiple exclamation marks (!!!)');
    console.log();
    
    console.log('✅ Better Alternatives:');
    console.log('   - "Order Confirmation" instead of "🎉 Payment Successful!"');
    console.log('   - "Access Your Course" instead of "🚀 CLICK HERE NOW!!!"');
    console.log('   - "Thank you for your purchase" instead of "CONGRATULATIONS!"');
}

// Test the improved email
async function testImprovedEmail() {
    console.log('🧪 Testing Improved Email Template...\n');
    
    const testPaymentDetails = {
        payment_id: 'pay_test_improved_' + Date.now(),
        order_id: 'order_test_improved_' + Date.now()
    };
    
    const result = await sendImprovedEmail('code.commerce999@gmail.com', testPaymentDetails);
    
    if (result.success) {
        console.log('\n✅ Test completed successfully!');
        console.log('📧 Check your inbox for the improved email format');
        console.log('🎯 This version should have much lower spam score');
    } else {
        console.log('\n❌ Test failed:', result.error);
    }
    
    showSpamPreventionTips();
}

// Command line handling
const args = process.argv.slice(2);
if (args.includes('test')) {
    testImprovedEmail();
} else {
    console.log('Usage: node improved-email-delivery.js test');
    console.log('       This will send a test email with improved formatting');
    showSpamPreventionTips();
}

module.exports = {
    sendImprovedEmail,
    createSpamResistantEmail,
    generateServerEmailTemplate
};
