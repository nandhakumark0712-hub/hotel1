const express = require('express');
const router = express.Router();
const { addReview, getHotelReviews, replyToReview } = require('../controllers/reviewController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createResourceLimiter } = require('../middleware/rateLimiter');
const { validateReview, validateManagerReply, validateMongoId } = require('../middleware/validators');

router.post('/', protect, createResourceLimiter, validateReview, addReview);
router.get('/:hotelId', validateMongoId('hotelId'), getHotelReviews);
router.put('/reply/:reviewId', protect, authorize('manager', 'admin'), validateManagerReply, replyToReview);

module.exports = router;
