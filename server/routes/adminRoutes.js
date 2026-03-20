const express = require('express');
const router = express.Router();
const { 
    getUsers, updateUser, deleteUser, getBookings, getHotels, deleteHotel, 
    updateHotelStatus, getStats, sendPromotionalOffer, getPromotions, deletePromotion, getPayments, getReviews, deleteReview 
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin'));

router.route('/users').get(getUsers);
router.route('/users/:id').put(updateUser).delete(deleteUser);

router.get('/bookings', getBookings);
router.get('/payments', getPayments);
router.get('/reviews', getReviews);
router.delete('/reviews/:id', deleteReview);

router.route('/hotels').get(getHotels);
router.route('/hotels/:id').put(updateHotelStatus).delete(deleteHotel);

router.post('/promote', sendPromotionalOffer);

router.get('/stats', getStats);
router.get('/promotions', getPromotions);
router.delete('/promotions/:id', deletePromotion);

module.exports = router;
