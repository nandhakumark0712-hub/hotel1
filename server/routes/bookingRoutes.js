const express = require('express');
const router = express.Router();
const { 
    createBooking, 
    getMyBookings, 
    cancelBooking, 
    updateBooking, 
    checkAvailability,
    getHotelBookings,
    payBooking 
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createResourceLimiter } = require('../middleware/rateLimiter');
const { validateCreateBooking, validateMongoId } = require('../middleware/validators');

router.post('/', protect, createResourceLimiter, validateCreateBooking, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/check-availability', checkAvailability);
router.get('/hotel/:hotelId', protect, authorize('manager', 'admin'), getHotelBookings);

router.route('/:id')
    .put(protect, validateMongoId('id'), updateBooking)
    .delete(protect, validateMongoId('id'), cancelBooking);

router.put('/:id/pay', protect, payBooking);
router.put('/:id/cancel', protect, validateMongoId('id'), cancelBooking);

module.exports = router;
