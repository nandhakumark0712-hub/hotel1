const recommendationService = require('../services/recommendationService');

// @desc    Get recommended hotels
// @route   GET /api/hotels/recommended
// @access  Public (Optional User context)
exports.getRecommendedHotels = async (req, res) => {
    try {
        const userId = req.user ? req.user.id : null;
        
        // Optional search param for location
        const locationOptions = {
            city: req.query.city || null
        };
        const limit = parseInt(req.query.limit) || 10;

        const recommendedHotels = await recommendationService.getRecommendedHotels(userId, locationOptions, limit);

        res.status(200).json({
            success: true,
            count: recommendedHotels.length,
            data: recommendedHotels
        });
    } catch (error) {
        console.error('Recommendation Error:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error in generating recommendations',
            error: error.message
        });
    }
};
