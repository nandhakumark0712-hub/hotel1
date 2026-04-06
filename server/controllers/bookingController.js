const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const User = require('../models/User');
const { createNotification } = require('../utils/notificationService');

// Helper to get io from server module
const getIO = () => {
    try { return require('../server').io; } catch { return null; }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
    try {
        const { hotelId, roomId, checkIn, checkOut, totalPrice, paymentMethod } = req.body;
        const isAutoPay = ['razorpay', 'upi'].includes(paymentMethod);

        // Check if room is available for the dates
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room type not found' });

        const overlaps = await Booking.find({
            roomId,
            bookingStatus: { $ne: 'Cancelled' },
            $or: [
                { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
            ]
        });

        if (overlaps.length >= room.totalRooms) {
            return res.status(400).json({ success: false, message: 'No rooms of this type available for the selected dates' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            hotelId,
            roomId,
            checkIn: new Date(checkIn),
            checkOut: new Date(checkOut),
            totalPrice,
            paymentMethod,
            bookingStatus: isAutoPay ? 'Confirmed' : 'Pending',
            paymentStatus: isAutoPay ? 'Paid' : 'Unpaid'
        });

        // ── Notification: Booking Created ─────────────────────────────────
        try {
            const hotel = await Hotel.findById(hotelId).select('name');
            const user = await User.findById(req.user.id).select('email name');
            const checkInStr = new Date(checkIn).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
            const checkOutStr = new Date(checkOut).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

            await createNotification(getIO(), {
                userId: req.user.id,
                type: 'BOOKING_CONFIRMED',
                message: isAutoPay 
                    ? `Your booking at ${hotel?.name || 'the hotel'} from ${checkInStr} to ${checkOutStr} is confirmed and paid. Enjoy your stay! 🏨`
                    : `Your booking at ${hotel?.name || 'the hotel'} from ${checkInStr} to ${checkOutStr} has been received. Complete payment to confirm.`,
                userEmail: user?.email,
                userName: user?.name,
                metadata: {
                    hotelName: hotel?.name || 'NK Hotel',
                    checkIn: checkInStr,
                    checkOut: checkOutStr,
                    bookingId: booking._id.toString(),
                    totalPrice: totalPrice.toLocaleString('en-IN')
                }
            });
        } catch (notifErr) {
            console.error('[BookingController] Notification error:', notifErr.message);
        }
        // ─────────────────────────────────────────────────────────────────

        res.status(201).json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('hotelId', 'name location images')
            .populate('roomId', 'roomType price')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const hotel = await Hotel.findById(booking.hotelId);
        const isManager = hotel && hotel.managerId.toString() === req.user._id.toString();

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && !isManager) {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
        }

        booking.bookingStatus = 'Cancelled';
        await booking.save();

        // ── Notification: Booking Cancelled ───────────────────────────────
        try {
            const hotel = await Hotel.findById(booking.hotelId).select('name');
            const user = await User.findById(booking.userId).select('email name');

            await createNotification(getIO(), {
                userId: booking.userId.toString(),
                type: 'BOOKING_CANCELLED',
                message: `Your booking at ${hotel?.name || 'the hotel'} has been cancelled. If a refund applies, it will be processed shortly.`,
                userEmail: user?.email,
                userName: user?.name,
                metadata: {
                    bookingId: booking._id.toString(),
                    hotelName: hotel?.name || 'the hotel',
                    refundInfo: booking.paymentStatus === 'Paid' ? 'Refund will be processed within 5-7 business days' : 'No refund applicable for unpaid bookings'
                }
            });
        } catch (notifErr) {
            console.error('[BookingController] Notification error:', notifErr.message);
        }
        // ─────────────────────────────────────────────────────────────────

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update booking (dates or guest details)
// @route   PUT /api/bookings/:id
// @access  Private
exports.updateBooking = async (req, res) => {
    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        const hotel = await Hotel.findById(booking.hotelId);
        const isManager = hotel && hotel.managerId.toString() === req.user._id.toString();

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin' && !isManager) {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
        }

        // Check availability if dates are changed
        if (req.body.checkIn || req.body.checkOut) {
            const checkIn = req.body.checkIn || booking.checkIn;
            const checkOut = req.body.checkOut || booking.checkOut;
            const room = await Room.findById(booking.roomId);

            const overlaps = await Booking.find({
                _id: { $ne: booking._id },
                roomId: booking.roomId,
                bookingStatus: { $ne: 'Cancelled' },
                $or: [
                    { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
                ]
            });

            if (overlaps.length >= room.totalRooms) {
                return res.status(400).json({ success: false, message: 'No rooms available for the new dates' });
            }
        }

        booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Check real-time availability
// @route   GET /api/bookings/check-availability
// @access  Public
exports.checkAvailability = async (req, res) => {
    try {
        const { roomId, checkIn, checkOut } = req.query;
        const room = await Room.findById(roomId);
        if (!room) return res.status(404).json({ success: false, message: 'Room not found' });

        const overlaps = await Booking.find({
            roomId,
            bookingStatus: { $ne: 'Cancelled' },
            $or: [
                { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
            ]
        });

        const available = room.totalRooms - overlaps.length;
        res.json({ success: true, available: available > 0, unitsRemaining: available });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Confirm payment for a booking
// @route   PUT /api/bookings/:id/pay
// @access  Private
exports.payBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

        if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized to modify this booking' });
        }

        booking.paymentStatus = 'Paid';
        booking.bookingStatus = 'Confirmed';
        await booking.save();

        // ── Notification: Payment Received ───────────────────────────────
        try {
            const hotel = await Hotel.findById(booking.hotelId).select('name');
            const user = await User.findById(booking.userId).select('email name');

            await createNotification(getIO(), {
                userId: booking.userId.toString(),
                type: 'PAYMENT_CONFIRMED',
                message: `Payment of ₹${booking.totalPrice.toLocaleString('en-IN')} received for your stay at ${hotel?.name || 'the hotel'}. Your booking is now confirmed!`,
                userEmail: user?.email,
                userName: user?.name,
                metadata: {
                    paymentId: booking.paymentId || 'N/A',
                    amount: booking.totalPrice.toLocaleString('en-IN'),
                    hotelName: hotel?.name || 'the hotel'
                }
            });
        } catch (notifErr) {
            console.error('[BookingController] Notification error:', notifErr.message);
        }
        // ─────────────────────────────────────────────────────────────────

        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get bookings for a specific hotel (for managers)
// @route   GET /api/bookings/hotel/:hotelId
// @access  Private (Manager/Admin)
exports.getHotelBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ hotelId: req.params.hotelId })
            .populate('userId', 'name email')
            .populate('roomId', 'roomType price')
            .sort({ createdAt: -1 });
        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
