const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    type: {
        type: String,
        enum: ['LOGIN', 'BOOKING_CONFIRMED', 'PAYMENT_CONFIRMED', 'BOOKING_CANCELLED', 'PROMO_OFFER', 'SYSTEM'],
        default: 'SYSTEM'
    },
    message: {
        type: String,
        required: [true, 'Notification message is required']
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Notification', notificationSchema);
