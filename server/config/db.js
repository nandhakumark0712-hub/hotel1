const mongoose = require('mongoose');
const dns = require('dns');

// If Node.js version is >= 17, it uses IPv6 by default which often fails with Atlas SRV records on local networks.
// This forces IPv4 priority for DNS lookups.
if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
}

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-booking';
        
        await mongoose.connect(mongoURI, {
            family: 4, // Force IPv4 (fixes many ECONNREFUSED/SRV issues on modern Node versions)
            serverSelectionTimeoutMS: 10000, // Wait 10 seconds before failing
        });
        
        console.log(`✅ MongoDB Connected Successfully: ${mongoose.connection.host}`);
    } catch (err) {
        console.error(`❌ MongoDB Connection Error details: ${err}`);
        console.error(`❌ Connection failed. please check: 1. Is your IP whitelisted in Atlas? 2. Is your connection string correct?`);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;
