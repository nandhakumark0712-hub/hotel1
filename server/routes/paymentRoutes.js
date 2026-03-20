const express = require('express');
const router = express.Router();
const { 
    createCheckoutSession, 
    confirmPayment, 
    processRefund 
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/confirm/:sessionId', protect, confirmPayment);
router.post('/refund/:bookingId', protect, processRefund);

module.exports = router;
