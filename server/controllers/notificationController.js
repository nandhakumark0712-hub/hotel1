const Notification = require('../models/Notification');

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50);

        const unreadCount = notifications.filter(n => !n.isRead).length;

        res.json({
            success: true,
            count: notifications.length,
            unreadCount,
            data: notifications
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Mark all notifications as read (or a specific one)
// @route   PUT /api/notifications/read
// @access  Private
exports.markAsRead = async (req, res) => {
    try {
        const { notificationId } = req.body;

        if (notificationId) {
            // Mark a single notification as read (must belong to this user)
            const notification = await Notification.findOneAndUpdate(
                { _id: notificationId, userId: req.user._id },
                { isRead: true },
                { new: true }
            );
            if (!notification) {
                return res.status(404).json({ success: false, message: 'Notification not found' });
            }
            return res.json({ success: true, data: notification });
        }

        // Mark ALL as read
        await Notification.updateMany(
            { userId: req.user._id, isRead: false },
            { isRead: true }
        );

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });

        if (!notification) {
            return res.status(404).json({ success: false, message: 'Notification not found' });
        }

        res.json({ success: true, message: 'Notification deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Send promotional notification to all users (admin only)
// @route   POST /api/notifications/promo
// @access  Private (Admin)
exports.sendPromoNotification = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const User = require('../models/User');
        const { createNotification } = require('../utils/notificationService');
        const { io } = require('../server');

        const users = await User.find({ role: 'customer' }).select('_id email name');

        const promises = users.map(user =>
            createNotification(io, {
                userId: user._id.toString(),
                type: 'PROMO_OFFER',
                message,
                userEmail: user.email,
                userName: user.name
            })
        );

        await Promise.all(promises);

        res.json({ success: true, message: `Promo sent to ${users.length} users` });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
