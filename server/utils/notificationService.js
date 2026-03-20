const Notification = require('../models/Notification');
const sendEmail = require('./emailService');
const { 
    bookingConfirmationTemplate, 
    paymentConfirmationTemplate, 
    cancellationTemplate, 
    promotionalTemplate 
} = require('./emailTemplates');

/**
 * createNotification
 * @param {Object} io          - Socket.io server instance
 * @param {Object} options
 * @param {string} options.userId      - Recipient user _id
 * @param {string} options.type        - Notification type enum
 * @param {string} options.message     - Simple text message for DB/Socket
 * @param {string} [options.userEmail] - Recipient email
 * @param {string} [options.userName]  - Recipient name
 * @param {Object} [options.metadata]  - Extra fields for specific HTML templates
 */
const createNotification = async (io, { userId, type, message, userEmail, userName, metadata = {} }) => {
    try {
        // 1. Persist to DB
        const notification = await Notification.create({ userId, type, message });

        // 2. Real-time: emit to user
        if (io) {
            io.to(`user_${userId}`).emit('notification', {
                _id: notification._id,
                type,
                message,
                isRead: false,
                createdAt: notification.createdAt
            });
        }

        // 3. Email notification with specialized templates
        if (userEmail) {
            let html = '';
            let subject = getEmailSubject(type);

            switch (type) {
                case 'BOOKING_CONFIRMED':
                    html = bookingConfirmationTemplate({
                        userName,
                        hotelName: metadata.hotelName,
                        checkIn: metadata.checkIn,
                        checkOut: metadata.checkOut,
                        bookingId: metadata.bookingId || notification._id.toString(),
                        totalPrice: metadata.totalPrice
                    });
                    break;
                case 'PAYMENT_CONFIRMED':
                    html = paymentConfirmationTemplate({
                        userName,
                        paymentId: metadata.paymentId,
                        amount: metadata.amount,
                        hotelName: metadata.hotelName
                    });
                    break;
                case 'BOOKING_CANCELLED':
                    html = cancellationTemplate({
                        userName,
                        bookingId: metadata.bookingId || notification._id.toString(),
                        hotelName: metadata.hotelName,
                        refundInfo: metadata.refundInfo
                    });
                    break;
                case 'PROMO_OFFER':
                    html = promotionalTemplate({
                        title: metadata.title || 'Exclusive Summer Deal',
                        discount: metadata.discount || '20',
                        message: metadata.message,
                        hotelName: metadata.hotelName,
                        offerLink: metadata.offerLink || (process.env.CLIENT_URL || 'http://localhost:5173')
                    });
                    subject = `🎉 ${metadata.title || 'Special Offer just for you!'}`;
                    break;
                default:
                    // Fallback to a simple text-based message or a default template could be placed here
                    html = `<p>Hello ${userName},</p><p>${message}</p>`;
            }

            if (html) {
                await sendEmail({ to: userEmail, subject, html });
            }
        }

        return notification;
    } catch (err) {
        console.error('[NotificationService] Error:', err.message);
    }
};

const getEmailSubject = (type) => {
    const subjects = {
        BOOKING_CONFIRMED: '🏨 Your Booking is Confirmed — NK Hotel Bookings',
        PAYMENT_CONFIRMED: '✅ Payment Received — NK Hotel Bookings',
        BOOKING_CANCELLED: '❌ Booking Cancellation — NK Hotel Bookings',
        PROMO_OFFER: '🎉 Special Offer Just for You — NK Hotel Bookings',
        SYSTEM: '📢 Notification from NK Hotel Bookings'
    };
    return subjects[type] || subjects.SYSTEM;
};

module.exports = { createNotification };
