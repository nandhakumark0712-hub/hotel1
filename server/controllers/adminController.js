const User = require('../models/User');
const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const Promotion = require('../models/Promotion');
const { createNotification, sendPromotionToAll } = require('../utils/notificationService');

const getIO = () => {
    try { return require('../server').io; } catch { return null; }
};

// @desc    Send Promotional Offer to Users
// @route   POST /api/admin/promote
// @access  Private (Admin)
exports.sendPromotionalOffer = async (req, res) => {
    try {
        const { userId, message, title, discount, offerLink } = req.body;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        // The logic below for individually selecting users is kept only if we ever want to target specific userIds
        // But the requirement currently says send to all registered/logged in customers
        // So we will ignore userId if provided for now for "Promotional Offers" per the new requirement.

        // 3. Save officially to Promotion model for the Landing Page
        await Promotion.create({
            title: title || 'Special Offer',
            message: message,
            discount: discount || '10',
            offerLink: offerLink || (process.env.CLIENT_URL || 'http://localhost:5173'),
            hotelId: req.body.hotelId || null
        });

        // 4. Fetch hotel name if specific
        let hotelName = null;
        if (req.body.hotelId) {
            const hotel = await Hotel.findById(req.body.hotelId);
            if (hotel) {
                hotelName = hotel.name;
                await Hotel.findByIdAndUpdate(req.body.hotelId, {
                    promotion: {
                        title: title || 'Special Offer',
                        discount: discount || 10,
                        message: message,
                        isActive: true
                    }
                });
            }
        }

        // 5. Broadcast notifications & emails to all customers
        const result = await sendPromotionToAll(getIO(), {
            title: title || 'Special Offer',
            discount: discount || '10',
            message: message,
            hotelName: hotelName,
            offerLink: offerLink || (process.env.CLIENT_URL || 'http://localhost:5173')
        });

        res.json({ 
            success: true, 
            message: `Promotional offer has been broadcast to all customers successfully.` 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort('-createdAt');
        res.json({ success: true, count: users.length, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/admin/bookings
// @access  Private (Admin)
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .populate('userId', 'name email')
            .populate('hotelId', 'name')
            .sort('-createdAt');
        res.json({ success: true, count: bookings.length, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all hotels
// @route   GET /api/admin/hotels
// @access  Private (Admin)
exports.getHotels = async (req, res) => {
    try {
        const hotels = await Hotel.find({}).populate('managerId', 'name email').sort('-createdAt');
        res.json({ success: true, count: hotels.length, data: hotels });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Approve or Reject Hotel
// @route   PUT /api/admin/hotels/:id/status
// @access  Private (Admin)
exports.updateHotelStatus = async (req, res) => {
    try {
        const { isApproved } = req.body;
        const hotel = await Hotel.findByIdAndUpdate(req.params.id, { isApproved }, { new: true });
        res.json({ success: true, data: hotel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalHotels = await Hotel.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const revenueResult = await Booking.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = revenueResult[0] ? revenueResult[0].total : 0;

        // User Growth (last 6 months)
        const userGrowth = await User.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Monthly Revenue
        const monthlyRevenue = await Booking.aggregate([
            { $match: { paymentStatus: 'Paid' } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    revenue: { $sum: '$totalPrice' }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Most Booked Hotels
        const mostBooked = await Booking.aggregate([
            { $match: { bookingStatus: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: "$hotelId",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'hotels',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'hotel'
                }
            },
            { $unwind: '$hotel' },
            {
                $project: {
                    name: '$hotel.name',
                    count: 1
                }
            }
        ]);

        res.json({
            success: true,
            data: {
                totalUsers,
                totalHotels,
                totalBookings,
                totalRevenue,
                userGrowth,
                monthlyRevenue,
                mostBooked
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a hotel
// @route   DELETE /api/admin/hotels/:id
// @access  Private (Admin)
exports.deleteHotel = async (req, res) => {
    try {
        await Hotel.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Hotel deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all payments
// @route   GET /api/admin/payments
// @access  Private (Admin)
exports.getPayments = async (req, res) => {
    try {
        const payments = await Booking.find({ paymentStatus: 'Paid' })
            .populate('userId', 'name email')
            .populate('hotelId', 'name')
            .sort('-updatedAt');
        res.json({ success: true, count: payments.length, data: payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get all reviews
// @route   GET /api/admin/reviews
// @access  Private (Admin)
exports.getReviews = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('userId', 'name email')
            .populate('hotelId', 'name')
            .sort('-createdAt');
        res.json({ success: true, count: reviews.length, data: reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a review
// @route   DELETE /api/admin/reviews/:id
// @access  Private (Admin)
exports.deleteReview = async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Review removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc    Get all promotions
// @route   GET /api/admin/promotions
// @access  Private (Admin)
exports.getPromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find({}).populate('hotelId', 'name').sort('-createdAt');
        res.json({ success: true, count: promotions.length, data: promotions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete a promotion
// @route   DELETE /api/admin/promotions/:id
// @access  Private (Admin)
exports.deletePromotion = async (req, res) => {
    try {
        const promotion = await Promotion.findByIdAndDelete(req.params.id);
        if (!promotion) return res.status(404).json({ success: false, message: 'Promotion not found' });
        res.json({ success: true, message: 'Promotion removed successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
