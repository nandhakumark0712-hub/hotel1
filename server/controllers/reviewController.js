const Review = require('../models/Review');
const Hotel = require('../models/Hotel');

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
exports.addReview = async (req, res) => {
    try {
        const { hotelId, rating, comment } = req.body;

        const hotel = await Hotel.findById(hotelId);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        const review = await Review.create({
            userId: req.user.id,
            hotelId,
            rating,
            comment
        });

        res.status(201).json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get hotel reviews
// @route   GET /api/reviews/:hotelId
// @access  Public
exports.getHotelReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ hotelId: req.params.hotelId })
            .populate('userId', 'name profileImage')
            .sort('-createdAt');
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reply to review
// @route   PUT /api/reviews/reply/:reviewId
// @access  Private (Manager)
exports.replyToReview = async (req, res) => {
    try {
        const { managerReply } = req.body;
        
        const review = await Review.findById(req.params.reviewId).populate('hotelId');
        if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
        
        // Ensure the manager replying is the manager of the hotel
        if (review.hotelId.managerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to reply to this review' });
        }

        review.managerReply = managerReply;
        await review.save();

        res.json({ success: true, data: review });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
