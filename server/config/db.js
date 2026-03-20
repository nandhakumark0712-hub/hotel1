const mongoose = require('mongoose');
const dns = require('dns');

/**
 * FIXED FOR WINDOWS: FORCE GOOGLE DNS
 * This specifically fixes the "querySrv ECONNREFUSED" error by manually 
 * setting the DNS servers for Node.js to resolve Atlas SRV records.
 */
try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    console.log('🌐 DNS Override: Using Google DNS (8.8.8.8) for Atlas connection.');
} catch (err) {
    console.warn('⚠️ DNS Override failed:', err.message);
}

// Ensure IPv4 is prioritized for local connections
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI;

        if (!mongoURI) {
            console.error('❌ Error: MONGO_URI is missing in .env!');
            process.exit(1);
        }

        console.log('⏳ Connecting to MongoDB Atlas...');

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000, 
        });

        console.log(`✅ MongoDB Successfully Connected to: ${mongoose.connection.host}`);
    } catch (err) {
        console.error(`❌ Connection Error: ${err.message}`);
        
        if (err.message.includes('ECONNREFUSED')) {
            console.error('💡 PRO-TIP: Your DNS is still blocking the connection. Restarting your terminal might help.');
        } else if (err.message.includes('auth')) {
            console.error('💡 PRO-TIP: Check your Atlas Password in the .env file.');
        }
        
        process.exit(1);
    }
};

module.exports = connectDB;
