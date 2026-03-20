const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

// @desc    Search hotels with filters and aggregations
// @route   GET /api/search/hotels
// @access  Public
exports.searchHotels = async (req, res) => {
    try {
        const { 
            location, 
            priceRange, 
            rating, 
            amenities, 
            checkIn, 
            checkOut,
            limit = 10 
        } = req.query;

        let matchStage = { isApproved: true };

        // 1. Improved Location match (Check City, Address, and State)
        if (location) {
            matchStage.$or = [
                { 'location.city': { $regex: location, $options: 'i' } },
                { 'location.address': { $regex: location, $options: 'i' } },
                { 'location.state': { $regex: location, $options: 'i' } }
            ];
        }

        // 2. Rating match
        if (rating) {
            matchStage.rating = { $gte: Number(rating) };
        }

        // 3. Amenities match (must have all specified amenities)
        if (amenities) {
            const amenitiesArray = amenities.split(',').map(a => a.trim());
            matchStage.amenities = { $all: amenitiesArray };
        }

        // 4. Availability Check
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

        // 5. Price Range handling
        let minPrice = 0;
        let maxPrice = Number.MAX_SAFE_INTEGER;
        if (priceRange) {
            const [min, max] = priceRange.split('-');
            if (min) minPrice = Number(min);
            if (max) maxPrice = Number(max);
        }

        // Build Aggregation Pipeline
        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: 'rooms',
                    localField: '_id',
                    foreignField: 'hotelId',
                    as: 'rooms'
                }
            },
            {
                $addFields: {
                    filteredRooms: {
                        $filter: {
                            input: '$rooms',
                            as: 'room',
                            cond: {
                                $and: [
                                    { $gte: ['$$room.price', minPrice] },
                                    { $lte: ['$$room.price', maxPrice] },
                                    excludedRoomIds.length > 0 ? { $not: { $in: ['$$room._id', excludedRoomIds] } } : true
                                ]
                            }
                        }
                    }
                }
            },
            // Removed strict room requirement to show all approved hotels
            // { $match: { 'filteredRooms.0': { $exists: true } } },
            {
                $project: {
                    name: 1,
                    description: 1,
                    location: 1,
                    images: 1,
                    rating: 1,
                    amenities: 1,
                    startingPrice: { $min: '$filteredRooms.price' },
                    roomCount: { $size: '$filteredRooms' }
                }
            },
            { $sort: { rating: -1, startingPrice: 1 } },
            { $limit: Number(limit) }
        ];

        const hotels = await Hotel.aggregate(pipeline);

        res.json({ success: true, count: hotels.length, data: hotels });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
