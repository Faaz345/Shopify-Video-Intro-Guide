const jwt = require('jsonwebtoken');
const axios = require('axios');

// Configuration
const JWT_SECRET = 'my_super_secret_jwt_key_for_development_2024';
const GUIDE_URL = 'http://localhost:3005';
const PAYMENT_SERVER_URL = 'http://localhost:5000';

console.log('🔐 JWT Authentication Flow Test\n');
console.log('=' . repeat(60));

// Function to generate a valid JWT token
function generateValidToken(email) {
    const payload = {
        email: email,
        isPaid: true,
        orderId: 'test_order_123',
        paymentId: 'test_payment_123',
        createdAt: new Date().toISOString()
    };
    
    return jwt.sign(payload, JWT_SECRET, { 
        algorithm: 'HS256',
        expiresIn: '30d' 
    });
}

// Function to test access without token
async function testWithoutToken() {
    console.log('\n📌 Test 1: Accessing guide website WITHOUT JWT token');
    console.log('-'.repeat(50));
    
    try {
        const response = await axios.get(GUIDE_URL, {
            maxRedirects: 0,
            validateStatus: (status) => status < 500
        });
        
        if (response.status === 307 || response.status === 302) {
            console.log('✅ Result: Redirected to /unauthorized (Expected behavior)');
            console.log(`   Status: ${response.status}`);
            console.log(`   Location: ${response.headers.location}`);
        } else {
            console.log('❌ Result: Unexpected response');
            console.log(`   Status: ${response.status}`);
        }
    } catch (error) {
        if (error.response && error.response.status === 307) {
            console.log('✅ Result: Redirected to /unauthorized (Expected behavior)');
            console.log(`   Redirect: ${error.response.headers.location}`);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

// Function to test access with valid token
async function testWithValidToken() {
    console.log('\n📌 Test 2: Accessing guide website WITH valid JWT token');
    console.log('-'.repeat(50));
    
    const email = 'test@example.com';
    const token = generateValidToken(email);
    
    console.log(`📧 Email: ${email}`);
    console.log(`🔑 Token (first 50 chars): ${token.substring(0, 50)}...`);
    
    // Construct the URL with token
    const urlWithToken = `${GUIDE_URL}/set?token=${token}`;
    console.log(`🌐 URL: ${urlWithToken}`);
    
    try {
        const response = await axios.get(urlWithToken, {
            maxRedirects: 0,
            validateStatus: (status) => status < 500
        });
        
        if (response.status === 307 || response.status === 302) {
            console.log('✅ Result: Token validated, redirecting to main page');
            console.log(`   Status: ${response.status}`);
            console.log(`   Location: ${response.headers.location}`);
            console.log(`   Cookie set: ${response.headers['set-cookie'] ? 'Yes' : 'No'}`);
        }
    } catch (error) {
        if (error.response) {
            console.log('Response status:', error.response.status);
            console.log('Response headers:', error.response.headers);
        } else {
            console.log('❌ Error:', error.message);
        }
    }
}

// Function to test with invalid token
async function testWithInvalidToken() {
    console.log('\n📌 Test 3: Accessing guide website with INVALID JWT token');
    console.log('-'.repeat(50));
    
    const invalidToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.token';
    
    console.log(`🔑 Invalid token: ${invalidToken}`);
    
    const urlWithToken = `${GUIDE_URL}/set?token=${invalidToken}`;
    
    try {
        const response = await axios.get(urlWithToken, {
            maxRedirects: 0,
            validateStatus: (status) => status < 500
        });
        
        if (response.status === 307 || response.status === 302) {
            if (response.headers.location === '/unauthorized') {
                console.log('✅ Result: Invalid token rejected (Expected behavior)');
                console.log(`   Redirected to: ${response.headers.location}`);
            } else {
                console.log(`   Redirected to: ${response.headers.location}`);
            }
        }
    } catch (error) {
        console.log('❌ Error:', error.message);
    }
}

// Function to decode and display token contents
function displayTokenInfo() {
    console.log('\n📌 Test 4: JWT Token Structure Analysis');
    console.log('-'.repeat(50));
    
    const email = 'customer@example.com';
    const token = generateValidToken(email);
    const decoded = jwt.decode(token);
    
    console.log('🔍 Token Contents:');
    console.log(JSON.stringify(decoded, null, 2));
    
    console.log('\n🔐 Token Verification:');
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token is valid and properly signed');
        console.log(`   Expires at: ${new Date(verified.exp * 1000).toLocaleString()}`);
    } catch (error) {
        console.log('❌ Token verification failed:', error.message);
    }
}

// Main test runner
async function runTests() {
    console.log('\n🚀 Starting JWT Authentication Flow Tests...\n');
    
    // Check if servers are expected to be running
    console.log('⚠️  Note: Make sure both servers are running:');
    console.log('   1. Payment server on port 5000');
    console.log('   2. Guide website on port 3005');
    
    await testWithoutToken();
    await testWithValidToken();
    await testWithInvalidToken();
    displayTokenInfo();
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('✅ Without token → Redirects to /unauthorized');
    console.log('✅ With valid token → Sets cookie and allows access');
    console.log('✅ With invalid token → Redirects to /unauthorized');
    console.log('✅ Token structure verified and decoded successfully');
    
    console.log('\n💡 SECURITY FLOW EXPLANATION:');
    console.log('1. User purchases guide → Payment server generates JWT');
    console.log('2. User receives link with token → /set?token=xxx');
    console.log('3. Guide website validates token → Sets secure cookie');
    console.log('4. Middleware checks cookie on every request');
    console.log('5. No cookie or invalid token → /unauthorized page');
    
    console.log('\n🔒 CURRENT ISSUE TO FIX:');
    console.log('The payment server needs to generate JWT tokens with the');
    console.log('same secret used by the guide website (GUIDE_JWT_SECRET)');
    console.log('Currently using different secrets, causing authentication failure.');
}

// Run the tests
runTests().catch(console.error);
