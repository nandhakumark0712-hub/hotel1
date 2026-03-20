const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Hotel name is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Description is required']
    },
    location: {
        city: { type: String, required: true },
        address: { type: String, required: true },
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    amenities: [String],
    images: [String],
    managerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    numReviews: {
        type: Number,
        default: 0
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    promotion: {
        title: String,
        discount: Number, // Percentage discount
        message: String,
        isActive: { type: Boolean, default: false }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate rooms
hotelSchema.virtual('rooms', {
    ref: 'Room',
    localField: '_id',
    foreignField: 'hotelId',
    justOne: false
});

// ── Indexes for performance ───────────────────────────────────────────────────
hotelSchema.index({ 'location.city': 1 });                    // city filter
hotelSchema.index({ rating: -1 });                            // sort by rating
hotelSchema.index({ isApproved: 1, rating: -1 });             // approved hotels by rating
hotelSchema.index({ managerId: 1 });                          // manager's hotels
hotelSchema.index({ 'location.city': 1, rating: -1 });        // city + rating compound
hotelSchema.index({ amenities: 1 });                          // amenities filter
hotelSchema.index({ createdAt: -1 });                         // newest hotels
hotelSchema.index({ name: 'text', description: 'text' });     // text search

module.exports = mongoose.model('Hotel', hotelSchema);
