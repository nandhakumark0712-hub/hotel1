const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');
const Promotion = require('../models/Promotion');

// @desc    Get all hotels
// @route   GET /api/hotels
// @access  Public
exports.getHotels = async (req, res) => {
    try {
        const { city, minRating, amenities, minPrice, maxPrice, checkIn, checkOut, managerId } = req.query;
        let query = {};
        
        if (!managerId) {
            query.isApproved = true;
        } else {
            query.managerId = new mongoose.Types.ObjectId(managerId);
        }

        // 1. Basic Filters
        if (city) {
            query.$or = [
                { 'location.city': { $regex: `^${city}$`, $options: 'i' } },
                { 'location.state': { $regex: `^${city}$`, $options: 'i' } }
            ];
        }
        if (minRating) query.rating = { $gte: Number(minRating) };
        if (amenities) query.amenities = { $all: amenities.split(',') };

        // 2. Availability Filtering (Complex)
        let excludedRoomIds = [];
        if (checkIn && checkOut) {
            const bookings = await Booking.find({
                bookingStatus: { $ne: 'Cancelled' },
                $or: [
                    { checkIn: { $lt: new Date(checkOut) }, checkOut: { $gt: new Date(checkIn) } }
                ]
            }).select('roomId');
            excludedRoomIds = bookings.map(b => b.roomId);
        }

        // 3. Aggregation Pipeline for Price & Availability
        let pipeline = [
            { $match: query },
            {
                $lookup: {
                    from: 'rooms',
                    localField: '_id',
                    foreignField: 'hotelId',
                    as: 'rooms'
                }
            },
            // Filter rooms based on price and availability
            {
                $addFields: {
                    rooms: {
                        $filter: {
                            input: '$rooms',
                            as: 'room',
                            cond: {
                                $and: [
                                    minPrice ? { $gte: ['$$room.price', Number(minPrice)] } : true,
                                    maxPrice ? { $lte: ['$$room.price', Number(maxPrice)] } : true,
                                    excludedRoomIds.length > 0 ? { $not: { $in: ['$$room._id', excludedRoomIds] } } : true
                                ]
                            }
                        }
                    }
                }
            }
        ];

        // Only keep hotels that have available rooms after filtering, EXCEPT for manager dashboard requests
        // if (!managerId) {
        //    pipeline.push({ $match: { 'rooms.0': { $exists: true } } });
        // }

        const hotels = await Hotel.aggregate(pipeline);

        res.json({ success: true, count: hotels.length, data: hotels });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get single hotel
// @route   GET /api/hotels/:id
// @access  Public
exports.getHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id).populate('rooms');
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });
        res.json({ success: true, data: hotel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create new hotel
// @route   POST /api/hotels
// @access  Private (Manager/Admin)
exports.createHotel = async (req, res) => {
    try {
        req.body.managerId = req.user.id;
        const hotel = await Hotel.create(req.body);
        res.status(201).json({ success: true, data: hotel });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private (Manager/Admin)
exports.updateHotel = async (req, res) => {
    try {
        let hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        // Check ownership
        if (hotel.managerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to update this hotel' });
        }

        hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, data: hotel });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
// @access  Private (Manager/Admin)
exports.deleteHotel = async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.id);
        if (!hotel) return res.status(404).json({ success: false, message: 'Hotel not found' });

        if (hotel.managerId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await hotel.remove();
        res.json({ success: true, message: 'Hotel removed' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get unique locations (cities)
// @route   GET /api/hotels/locations
// @access  Public
exports.getLocations = async (req, res) => {
    try {
        const locations = await Hotel.distinct('location.city');
        res.json({ success: true, data: locations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get manager dashboard stats
// @route   GET /api/hotels/manager/stats
// @access  Private (Manager)
exports.getManagerStats = async (req, res) => {
    try {
        const managerId = new mongoose.Types.ObjectId(req.user.id);
        
        // Total Hotels
        const totalHotels = await Hotel.countDocuments({ managerId });
        
        // Total Rooms
        const hotels = await Hotel.find({ managerId }).select('_id');
        const hotelIds = hotels.map(h => h._id);
        const rooms = await Room.aggregate([
            { $match: { hotelId: { $in: hotelIds } } },
            { $group: { _id: null, totalRooms: { $sum: '$totalRooms' } } }
        ]);
        const totalRooms = rooms[0]?.totalRooms || 0;

        // Bookings Today & Revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const bookings = await Booking.find({ 
            hotelId: { $in: hotelIds },
            bookingStatus: { $ne: 'Cancelled' }
        });
        
        let revenue = 0;
        let bookingsToday = 0;
        
        bookings.forEach(b => {
            revenue += (b.totalPrice || 0);
            if (new Date(b.createdAt) >= today) {
                bookingsToday++;
            }
        });

        res.json({ 
            success: true, 
            data: { totalHotels, totalRooms, bookingsToday, revenue }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};// @desc    Get active promotions
// @route   GET /api/hotels/promotions/active
// @access  Public
exports.getActivePromotions = async (req, res) => {
    try {
        const promotions = await Promotion.find({ 
            isActive: true,
            expiresAt: { $gte: new Date() }
        }).populate('hotelId', 'name').sort('-createdAt');
        
        res.json({ success: true, data: promotions });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
