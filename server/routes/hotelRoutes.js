const express = require('express');
const router = express.Router();
const { getHotels, getHotel, createHotel, updateHotel, deleteHotel, getLocations, getManagerStats, getActivePromotions } = require('../controllers/hotelController');
const { getRecommendedHotels } = require('../controllers/recommendationController');
const { protect, authorize, optionalProtect } = require('../middleware/authMiddleware');
const { validateCreateHotel, validateMongoId } = require('../middleware/validators');

router.get('/locations', getLocations);
router.get('/promotions/active', getActivePromotions);
router.get('/recommended', optionalProtect, getRecommendedHotels);
router.get('/manager/stats', protect, authorize('manager'), getManagerStats);

router.route('/')
    .get(getHotels)
    .post(protect, authorize('manager', 'admin'), validateCreateHotel, createHotel);

router.route('/:id')
    .get(validateMongoId('id'), getHotel)
    .put(protect, authorize('manager', 'admin'), validateMongoId('id'), updateHotel)
    .delete(protect, authorize('manager', 'admin'), validateMongoId('id'), deleteHotel);

module.exports = router;
