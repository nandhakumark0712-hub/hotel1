const cache = require('../config/redis');

/**
 * cacheMiddleware - Express middleware factory
 * @param {string} keyFn - A function (req) => string that generates the cache key
 * @param {number} ttl - Time to live in seconds (default 5 min)
 */
const cacheMiddleware = (keyFn, ttl = 300) => {
    return async (req, res, next) => {
        const key = typeof keyFn === 'function' ? keyFn(req) : keyFn;
        
        try {
            const cached = await cache.get(key);
            if (cached) {
                return res.json({ ...cached, fromCache: true });
            }
        } catch {
            // Cache miss or error - continue to handler
        }

        // Override res.json to intercept and cache the response
        const originalJson = res.json.bind(res);
        res.json = async (body) => {
            // Only cache successful responses
            if (res.statusCode >= 200 && res.statusCode < 300 && body.success !== false) {
                await cache.set(key, body, ttl);
            }
            return originalJson(body);
        };

        next();
    };
};

// Predefined cache key generators
const CacheKeys = {
    hotels: (req) => `hotels:${req.query.city || ''}:${req.query.minPrice || ''}:${req.query.maxPrice || ''}:${req.query.rating || ''}:${req.query.page || 1}`,
    hotel: (req) => `hotel:${req.params.id}`,
    hotelLocations: () => 'hotels:locations',
    recommendations: (req) => `recommendations:${req.user?.id || 'guest'}:${req.query.limit || 8}`,
    adminStats: () => 'admin:stats',
    searchHotels: (req) => `search:${req.query.location || ''}:${req.query.priceRange || ''}:${req.query.rating || ''}:${req.query.amenities || ''}`,
};

module.exports = { cacheMiddleware, CacheKeys };
