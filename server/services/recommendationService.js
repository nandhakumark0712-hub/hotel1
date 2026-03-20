const Hotel = require('../models/Hotel');
const Booking = require('../models/Booking');
const mongoose = require('mongoose');

class RecommendationService {
    async getRecommendedHotels(userId, locationOptions = {}, limit = 10) {
        let userPastHotelIds = [];
        let userPastCities = [];
        let similarUsersHotelIds = [];

        // 1. If user is logged in, get their booking history
        if (userId) {
            const userBookings = await Booking.find({ userId, bookingStatus: { $ne: 'Cancelled' } })
                .populate('hotelId', 'location.city _id');

            userPastHotelIds = userBookings.map(b => new mongoose.Types.ObjectId(b.hotelId._id));
            userPastCities = [...new Set(userBookings.map(b => b.hotelId.location.city))];

            // Collaborative filtering: find other users who booked the same hotels
            if (userPastHotelIds.length > 0) {
                const similarUsersBookings = await Booking.find({
                    hotelId: { $in: userPastHotelIds },
                    userId: { $ne: userId }
                }).distinct('userId');

                // Find other hotels booked by these similar users
                const similarHotels = await Booking.find({
                    userId: { $in: similarUsersBookings },
                    hotelId: { $nin: userPastHotelIds }
                }).distinct('hotelId');
                
                similarUsersHotelIds = similarHotels.map(id => new mongoose.Types.ObjectId(id));
            }
        }

        // 2. Perform aggregation to calculate relevance score
        const aggregationPipeline = [
            { $match: { isApproved: true } },
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
                    // Score 1: Base Rating (0-5 points)
                    ratingScore: { $ifNull: ['$rating', 0] },
                    // Score 2: Popularity based on reviews (capped at 5 points)
                    popularityScore: {
                        $min: [ { $divide: [{ $ifNull: ['$numReviews', 0] }, 10] }, 5 ]
                    },
                    // Score 3: Location Match (10 points if city matches searched location or past booking cities)
                    locationScore: {
                        $cond: [
                            { 
                                $or: [
                                    { $in: ['$location.city', userPastCities] },
                                    locationOptions.city ? { $regexMatch: { input: '$location.city', regex: new RegExp(locationOptions.city, 'i') } } : false
                                ]
                            },
                            10,
                            0
                        ]
                    },
                    // Score 4: Collaborative Filtering Match (5 points if similar users booked)
                    collabScore: {
                        $cond: [
                            { $in: ['$_id', similarUsersHotelIds] },
                            5,
                            0
                        ]
                    }
                }
            },
            {
                $addFields: {
                    totalRelevanceScore: {
                        $add: ['$ratingScore', '$popularityScore', '$locationScore', '$collabScore']
                    }
                }
            },
            { $sort: { totalRelevanceScore: -1, rating: -1, numReviews: -1 } },
            { $limit: limit }
        ];

        const recommendedHotels = await Hotel.aggregate(aggregationPipeline);
        
        // Populate manager basic info if needed (optional)
        return await Hotel.populate(recommendedHotels, { path: 'managerId', select: 'name email profileImage' });
    }
}

module.exports = new RecommendationService();
