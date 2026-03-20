const mongoose = require('mongoose');
const Notification = require('./models/Notification');
const Promotion = require('./models/Promotion');
const dotenv = require('dotenv');

dotenv.config();

const migratePromos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel-booking');
        
        const notifications = await Notification.find({ type: 'PROMO_OFFER' });
        console.log(`Found ${notifications.length} promotional notifications.`);
        
        let migratedCount = 0;
        for (const notif of notifications) {
            // Check if already migrated (by title/message)
            const exists = await Promotion.findOne({ 
                title: notif.metadata?.title || 'Special Offer',
                message: notif.message 
            });
            
            if (!exists) {
                await Promotion.create({
                    title: notif.metadata?.title || 'Special Offer',
                    message: notif.message,
                    discount: notif.metadata?.discount || '10',
                    offerLink: notif.metadata?.offerLink || 'http://localhost:5173',
                    hotelId: null, // We don't have this in notif metadata usually
                    isActive: true
                });
                migratedCount++;
            }
        }
        
        console.log(`Migrated ${migratedCount} promotions successfully.`);
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
};

migratePromos();
