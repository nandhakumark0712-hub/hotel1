const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Comment is required']
    },
    managerReply: {
        type: String,
        default: null
    }
}, {
    timestamps: true
});

// Update hotel rating after saving review
reviewSchema.statics.calculateAverageRating = async function(hotelId) {
    const stats = await this.aggregate([
        { $match: { hotelId } },
        {
            $group: {
                _id: '$hotelId',
                nRating: { $sum: 1 },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await mongoose.model('Hotel').findByIdAndUpdate(hotelId, {
            rating: Math.round(stats[0].avgRating * 10) / 10,
            numReviews: stats[0].nRating
        });
    } else {
        await mongoose.model('Hotel').findByIdAndUpdate(hotelId, {
            rating: 0,
            numReviews: 0
        });
    }
};

reviewSchema.post('save', function() {
    this.constructor.calculateAverageRating(this.hotelId);
});

// ── Indexes for performance ───────────────────────────────────────────────────
reviewSchema.index({ hotelId: 1, createdAt: -1 });  // hotel reviews sorted by date
reviewSchema.index({ userId: 1 });                  // user's reviews
reviewSchema.index({ hotelId: 1, rating: -1 });     // hotel reviews by rating

module.exports = mongoose.model('Review', reviewSchema);
