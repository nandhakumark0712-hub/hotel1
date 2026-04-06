const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    hotelId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Hotel',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    totalPrice: {
        type: Number,
        required: true
    },
    bookingStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid', 'Refunded'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['pay-at-hotel', 'stripe', 'razorpay', 'upi'],
        default: 'pay-at-hotel'
    },
    stripeSessionId: String,
    paymentId: String
}, {
    timestamps: true
});

// ── Indexes for performance ───────────────────────────────────────────────────
bookingSchema.index({ userId: 1, createdAt: -1 });         // user's bookings
bookingSchema.index({ hotelId: 1, bookingStatus: 1 });     // hotel bookings by status
bookingSchema.index({ roomId: 1, checkIn: 1, checkOut: 1 });// availability check
bookingSchema.index({ bookingStatus: 1 });                  // status filter
bookingSchema.index({ paymentStatus: 1 });                  // payment filter
bookingSchema.index({ checkIn: 1, checkOut: 1 });           // date range queries
bookingSchema.index({ createdAt: -1 });                     // recent bookings

module.exports = mongoose.model('Booking', bookingSchema);
