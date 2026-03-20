const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');
const Booking = require('../models/Booking');
const Room = require('../models/Room');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');

const getIO = () => {
    try { return require('../server').io; } catch { return null; }
};

// @desc    Create checkout session
// @route   POST /api/payments/create-checkout-session
// @access  Private
exports.createCheckoutSession = async (req, res) => {
    try {
        const { bookingId } = req.body;
        const booking = await Booking.findById(bookingId).populate('hotelId').populate('roomId');

        if (!booking) {
            console.error('[PaymentController] Booking not found:', bookingId);
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        console.log('[PaymentController] Creating session for booking:', bookingId);

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: `${booking.hotelId.name} - ${booking.roomId.type} Room`,
                        description: `Stay from ${new Date(booking.checkIn).toLocaleDateString()} to ${new Date(booking.checkOut).toLocaleDateString()}`,
                    },
                    unit_amount: Math.round(booking.totalPrice * 100),
                },
                quantity: 1,
            }],
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-cancel`,
            metadata: {
                bookingId: booking._id.toString()
            }
        });

        booking.stripeSessionId = session.id;
        await booking.save();

        res.json({ success: true, url: session.url });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Confirm payment
// @route   POST /api/payments/confirm/:sessionId
// @access  Private
exports.confirmPayment = async (req, res) => {
    try {
        console.log('[PaymentController] Confirming session:', req.params.sessionId);
        const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);

        if (session.payment_status === 'paid') {
            const booking = await Booking.findOne({ stripeSessionId: session.id }).populate('hotelId');
            if (booking) {
                console.log('[PaymentController] Found booking, updating status...');
                booking.paymentStatus = 'Paid';
                booking.bookingStatus = 'Confirmed';
                booking.paymentId = session.payment_intent;
                await booking.save();

                // ── Notification: Payment Confirmed ───────────────────────
                try {
                    const user = await User.findById(booking.userId).select('email name');
                    await createNotification(getIO(), {
                        userId: booking.userId.toString(),
                        type: 'PAYMENT_CONFIRMED',
                        message: `Payment of ₹${booking.totalPrice.toLocaleString('en-IN')} received. Your booking is now confirmed. Enjoy your stay! 🏨`,
                        userEmail: user?.email,
                        userName: user?.name,
                        metadata: {
                            paymentId: session.payment_intent,
                            amount: booking.totalPrice.toLocaleString('en-IN'),
                            hotelName: booking.hotelId?.name || 'the hotel'
                        }
                    });
                } catch (notifErr) {
                    console.error('[PaymentController] Notification error:', notifErr.message);
                }
                // ─────────────────────────────────────────────────────────

                return res.json({ success: true, message: 'Payment confirmed', booking });
            }
        }

        res.status(400).json({ success: false, message: 'Payment not successful' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Process refund
// @route   POST /api/payments/refund/:bookingId
// @access  Private
exports.processRefund = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.bookingId);
        if (!booking || !booking.paymentId) {
            return res.status(400).json({ success: false, message: 'Refund not possible' });
        }

        const refund = await stripe.refunds.create({
            payment_intent: booking.paymentId,
        });

        booking.paymentStatus = 'Refunded';
        booking.bookingStatus = 'Cancelled';
        await booking.save();

        res.json({ success: true, refund });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
