/**
 * MongoDB Atlas Connection Test
 * 
 * Usage:
 * 1. Replace MONGODB_URI with your actual connection string
 * 2. Run: node test-mongodb-connection.js
 * 3. If successful, you'll see "✅ MongoDB connected successfully!"
 */

const mongoose = require('mongoose');

// Replace this with your actual MongoDB connection string
const MONGODB_URI = 'mongodb+srv://shopifyguide:3pubXfd5ipefRdQU@cluster0.ufhfzix.mongodb.net/shopify-guide?retryWrites=true&w=majority&appName=Cluster0';

// Test configuration
const testConnection = async () => {
    console.log('🔄 Testing MongoDB connection...');
    console.log('📍 Connection string format check...');
    
    // Basic validation
    if (MONGODB_URI.includes('YOUR_PASSWORD') || MONGODB_URI.includes('<password>')) {
        console.error('❌ ERROR: Please replace YOUR_PASSWORD with your actual password!');
        console.error('   The connection string still contains placeholder text.');
        process.exit(1);
    }
    
    if (!MONGODB_URI.includes('mongodb+srv://')) {
        console.error('❌ ERROR: Invalid connection string format!');
        console.error('   Connection string should start with mongodb+srv://');
        process.exit(1);
    }
    
    if (!MONGODB_URI.includes('mongodb.net/')) {
        console.error('❌ ERROR: Invalid MongoDB Atlas URL!');
        console.error('   Make sure you copied the connection string from MongoDB Atlas');
        process.exit(1);
    }
    
    console.log('✅ Connection string format looks valid');
    console.log('🔄 Attempting to connect to MongoDB Atlas...');
    
    try {
        // Connection options
        const options = {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000, // 10 second timeout
        };
        
        // Attempt connection
        await mongoose.connect(MONGODB_URI, options);
        
        console.log('✅ MongoDB connected successfully!');
        console.log('📊 Connection Details:');
        console.log('   Database:', mongoose.connection.db.databaseName);
        console.log('   Host:', mongoose.connection.host);
        console.log('   Port:', mongoose.connection.port);
        console.log('   Ready State:', mongoose.connection.readyState === 1 ? 'Connected' : 'Not Connected');
        
        // Test write operation
        console.log('\n🔄 Testing write operation...');
        const TestSchema = new mongoose.Schema({
            testField: String,
            timestamp: Date
        });
        
        const TestModel = mongoose.model('Test', TestSchema);
        
        const testDoc = new TestModel({
            testField: 'Connection test successful',
            timestamp: new Date()
        });
        
        await testDoc.save();
        console.log('✅ Write test successful!');
        
        // Test read operation
        console.log('🔄 Testing read operation...');
        const found = await TestModel.findOne({ testField: 'Connection test successful' });
        if (found) {
            console.log('✅ Read test successful!');
        }
        
        // Clean up test data
        await TestModel.deleteOne({ _id: testDoc._id });
        console.log('🧹 Test data cleaned up');
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 ALL TESTS PASSED! MongoDB Atlas is properly configured!');
        console.log('='.repeat(50));
        console.log('\nYour connection string is working correctly.');
        console.log('You can now use this in your Render deployment.\n');
        
        // Show the connection string (with password hidden)
        const hiddenPassword = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
        console.log('Connection string (password hidden):');
        console.log(hiddenPassword);
        
        // Disconnect
        await mongoose.disconnect();
        console.log('\n👋 Disconnected from MongoDB');
        process.exit(0);
        
    } catch (error) {
        console.error('\n❌ MongoDB connection FAILED!');
        console.error('='.repeat(50));
        
        // Detailed error analysis
        if (error.message.includes('Authentication failed')) {
            console.error('🔐 AUTHENTICATION ERROR:');
            console.error('   1. Check your username and password');
            console.error('   2. Make sure password has no < > brackets');
            console.error('   3. Verify user exists in Database Access');
            console.error('   4. Check user has read/write permissions');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('ETIMEDOUT')) {
            console.error('🌐 NETWORK ERROR:');
            console.error('   1. Check your internet connection');
            console.error('   2. Verify cluster name is correct');
            console.error('   3. Make sure cluster is running (not paused)');
            console.error('   4. Check Network Access allows your IP (0.0.0.0/0 for cloud)');
        } else if (error.message.includes('querySrv')) {
            console.error('🔗 CONNECTION STRING ERROR:');
            console.error('   1. Make sure you copied the full connection string');
            console.error('   2. Check the cluster address is correct');
            console.error('   3. Ensure mongodb+srv:// protocol is used');
        } else if (error.message.includes('connect ECONNREFUSED')) {
            console.error('🚫 CONNECTION REFUSED:');
            console.error('   1. Check Network Access in MongoDB Atlas');
            console.error('   2. Add 0.0.0.0/0 to IP Whitelist');
            console.error('   3. Wait 2 minutes for changes to apply');
        } else {
            console.error('⚠️ UNKNOWN ERROR:');
            console.error('   Error details:', error.message);
        }
        
        console.error('\n📋 Checklist to fix:');
        console.error('   [ ] Network Access has 0.0.0.0/0 (for cloud deployment)');
        console.error('   [ ] Database user exists with correct password');
        console.error('   [ ] Connection string has actual password (no <>)');
        console.error('   [ ] Database name is included after .net/');
        console.error('   [ ] Cluster is running (green status in Atlas)');
        
        console.error('\nFull error:', error);
        process.exit(1);
    }
};

// Run the test
testConnection();
