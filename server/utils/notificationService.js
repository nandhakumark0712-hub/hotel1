const Notification = require('../models/Notification');
const sendEmail = require('./emailService');
const { 
    bookingConfirmationTemplate, 
    paymentConfirmationTemplate, 
    cancellationTemplate, 
    promotionalTemplate,
    loginEmailTemplate,
    resetPasswordTemplate,
    verifyEmailTemplate
} = require('./emailTemplates');
const User = require('../models/User');

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

        // 2. Data fetching fallback if email/name are missing
        let targetEmail = userEmail;
        let targetName = userName;

        if (!targetEmail || !targetName) {
            const user = await User.findById(userId).select('email name');
            if (user) {
                targetEmail = targetEmail || user.email;
                targetName = targetName || user.name;
            }
        }

        // 3. Real-time: emit to user (ensure userId is a string)
        const roomName = `user_${userId.toString()}`;
        if (io) {
            io.to(roomName).emit('notification', {
                _id: notification._id,
                type,
                message,
                isRead: false,
                createdAt: notification.createdAt
            });
        }

        // 4. Email notification with specialized templates
        if (targetEmail) {
            let html = '';
            let subject = getEmailSubject(type);

            switch (type) {
                case 'LOGIN':
                    html = loginEmailTemplate({
                        userName: targetName,
                        loginTime: metadata.loginTime || new Date().toLocaleString('en-IN')
                    });
                    subject = '🔔 Security Alert: New Login - NK Hotel Bookings';
                    break;
                case 'VERIFY_EMAIL':
                    html = verifyEmailTemplate(metadata.verifyUrl);
                    subject = '📧 Activate Your NK Hotel Bookings Account';
                    break;
                case 'PASSWORD_RESET':
                    html = resetPasswordTemplate(metadata.resetUrl);
                    subject = '🔑 Reset Your NK Hotel Bookings Password';
                    break;
                case 'BOOKING_CONFIRMED':
                    html = bookingConfirmationTemplate({
                        userName: targetName,
                        hotelName: metadata.hotelName,
                        checkIn: metadata.checkIn,
                        checkOut: metadata.checkOut,
                        bookingId: metadata.bookingId || notification._id.toString(),
                        totalPrice: metadata.totalPrice
                    });
                    break;
                case 'PAYMENT_CONFIRMED':
                    html = paymentConfirmationTemplate({
                        userName: targetName,
                        paymentId: metadata.paymentId,
                        amount: metadata.amount,
                        hotelName: metadata.hotelName
                    });
                    break;
                case 'BOOKING_CANCELLED':
                    html = cancellationTemplate({
                        userName: targetName,
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
                    html = `<p>Hello ${targetName},</p><p>${message}</p>`;
            }

            if (html) {
                // DON'T await sendEmail - let it run in the background
                sendEmail({ to: targetEmail, subject, html }).catch(err => 
                    console.error('[NotificationService] Background Email Error:', err.message)
                );
            }
        }

        return notification;
    } catch (err) {
        console.error('[NotificationService] Error:', err.message);
    }
};

const getEmailSubject = (type) => {
    const subjects = {
        LOGIN: '🔔 Account Login Notification — NK Hotel Bookings',
        PASSWORD_RESET: '🔑 Password Reset Request — NK Hotel Bookings',
        VERIFY_EMAIL: '✉️ Verify Your Email — NK Hotel Bookings',
        BOOKING_CONFIRMED: '🏨 Your Booking is Confirmed — NK Hotel Bookings',
        PAYMENT_CONFIRMED: '✅ Payment Received — NK Hotel Bookings',
        BOOKING_CANCELLED: '❌ Booking Cancellation — NK Hotel Bookings',
        PROMO_OFFER: '🎉 Special Offer Just for You — NK Hotel Bookings',
        SYSTEM: '📢 Notification from NK Hotel Bookings'
    };
    return subjects[type] || subjects.SYSTEM;
};

/**
 * sendPromotionToAll
 * Sends a promotional email to all registered customers
 */
const sendPromotionToAll = async (io, { title, discount, message, hotelName, offerLink }) => {
    try {
        const customers = await User.find({ role: 'customer' }).select('email name _id');
        console.log(`[NotificationService] Sending promo to ${customers.length} customers...`);

        const promoPromises = customers.map(customer => 
            createNotification(io, {
                userId: customer._id,
                type: 'PROMO_OFFER',
                message: `🎉 ${title}: Get ${discount}% OFF at ${hotelName || 'our selected hotels'}!`,
                userEmail: customer.email,
                userName: customer.name,
                metadata: { title, discount, message, hotelName, offerLink }
            })
        );

        // DON'T await Promise.allSettled - let the broadcast run in the background
        Promise.allSettled(promoPromises).then(results => {
            const successCount = results.filter(r => r.status === 'fulfilled').length;
            console.log(`[NotificationService] Broadcast complete. Successful: ${successCount}/${customers.length}`);
        });
        return { success: true, count: customers.length };
    } catch (err) {
        console.error('[NotificationService] Broadcast Error:', err.message);
        throw err;
    }
};

module.exports = { createNotification, sendPromotionToAll };
