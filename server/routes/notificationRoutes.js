const express = require('express');
const router = express.Router();
const {
    getNotifications,
    markAsRead,
    deleteNotification,
    sendPromoNotification
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All notification routes require authentication
router.use(protect);

// GET /api/notifications — fetch all notifications for the logged-in user
router.get('/', getNotifications);

// PUT /api/notifications/read — mark one (body: { notificationId }) or all as read
router.put('/read', markAsRead);

// DELETE /api/notifications/:id — delete a single notification
router.delete('/:id', deleteNotification);

// POST /api/notifications/promo — admin sends promo to all customers
router.post('/promo', authorize('admin'), sendPromoNotification);

module.exports = router;
