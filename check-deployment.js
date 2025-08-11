#!/usr/bin/env node

/**
 * Deployment Status Checker
 * Run this script to verify your Render deployment is working correctly
 * Usage: node check-deployment.js [your-render-url]
 */

const https = require('https');
const url = require('url');

const RENDER_URL = process.argv[2] || 'https://shopify-video-guide.onrender.com';

console.log(`
====================================
🔍 DEPLOYMENT STATUS CHECKER
====================================
Checking: ${RENDER_URL}
====================================
`);

const checks = [
    {
        name: 'Health Check',
        endpoint: '/health',
        validate: (data) => {
            return data.status === 'ok';
        }
    },
    {
        name: 'Environment Status',
        endpoint: '/api/env-status',
        validate: (data) => {
            const results = [];
            
            // Check Razorpay
            if (data.configuration.RAZORPAY_KEY_ID === '✅ Set' && 
                data.configuration.RAZORPAY_KEY_SECRET === '✅ Set') {
                results.push('✅ Razorpay configured');
            } else {
                results.push('❌ Razorpay NOT configured');
            }
            
            // Check MongoDB
            if (data.configuration.MONGODB_URI === '✅ Set') {
                results.push('✅ MongoDB configured');
            } else {
                results.push('⚠️  MongoDB using local fallback');
            }
            
            // Check Email
            if (data.configuration.GMAIL_USER !== 'NOT SET' && 
                data.configuration.GMAIL_APP_PASSWORD === '✅ Set') {
                results.push('✅ Email configured');
            } else {
                results.push('❌ Email NOT configured');
            }
            
            // Check critical issues
            if (data.criticalIssues && data.criticalIssues.length > 0) {
                results.push('⚠️  Critical Issues:');
                data.criticalIssues.forEach(issue => {
                    results.push(`   ${issue}`);
                });
            }
            
            return results;
        }
    }
];

async function checkEndpoint(baseUrl, endpoint) {
    return new Promise((resolve, reject) => {
        const fullUrl = baseUrl + endpoint;
        
        https.get(fullUrl, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ 
                        success: true, 
                        status: res.statusCode, 
                        data: json 
                    });
                } catch (error) {
                    resolve({ 
                        success: false, 
                        status: res.statusCode, 
                        error: 'Invalid JSON response' 
                    });
                }
            });
        }).on('error', (err) => {
            resolve({ 
                success: false, 
                error: err.message 
            });
        });
    });
}

async function runChecks() {
    console.log('Running deployment checks...\n');
    
    for (const check of checks) {
        console.log(`📍 ${check.name}`);
        console.log(`   Endpoint: ${check.endpoint}`);
        
        const result = await checkEndpoint(RENDER_URL, check.endpoint);
        
        if (result.success) {
            console.log(`   Status: ${result.status} OK`);
            
            if (check.validate) {
                const validation = check.validate(result.data);
                
                if (Array.isArray(validation)) {
                    validation.forEach(msg => console.log(`   ${msg}`));
                } else if (validation === true) {
                    console.log('   ✅ Validation passed');
                } else {
                    console.log('   ❌ Validation failed');
                }
            }
        } else {
            console.log(`   ❌ Error: ${result.error || 'Request failed'}`);
        }
        
        console.log('');
    }
    
    console.log(`
====================================
📊 DEPLOYMENT SUMMARY
====================================
If you see errors above, check:

1. Environment Variables in Render:
   - Go to Render Dashboard → Environment tab
   - Verify all required variables are set
   - NO quotes around values
   - NO spaces before/after = sign

2. Required Environment Variables:
   - RAZORPAY_KEY_ID
   - RAZORPAY_KEY_SECRET
   - MONGODB_URI (for production)
   - GMAIL_USER
   - GMAIL_APP_PASSWORD
   - GUIDE_JWT_SECRET
   - SESSION_SECRET
   - BASE_URL

3. If still not working:
   - Click "Manual Deploy" in Render
   - Check Logs tab for errors
   - Visit: ${RENDER_URL}/api/env-status

====================================
`);
}

runChecks().catch(console.error);
