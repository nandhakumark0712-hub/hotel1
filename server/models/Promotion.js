const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title']
    },
    message: {
        type: String,
        required: [true, 'Please add a message']
    },
    discount: {
        type: String,
        default: ''
    },
    offerLink: {
        type: String,
        default: ''
    },
    hotelId: {
        type: mongoose.Schema.ObjectId,
        ref: 'Hotel',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 7*24*60*60*1000) // Default 7 days
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Promotion', promotionSchema);
