const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // 15 minutes
    max: 1000,                      // Relaxed for testing
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes.'
    }
});

// Strict limiter for auth routes (login, register)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // 15 minutes
    max: 100,                        // allow more attempts during testing
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many authentication attempts. Please wait 15 minutes before trying again.'
    },
    skipSuccessfulRequests: true     // Don't count successful logins
});

// Strict limiter for password reset / sensitive operations
const sensitiveOpLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // 15 minutes
    max: 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many sensitive requests. Please try again later.'
    }
});

// Limiter for review / booking creation
const createResourceLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,       // 15 minutes
    max: 200,                        // allow more bookings during testing
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many resource creation requests. Please wait before trying again.'
    }
});

module.exports = { apiLimiter, authLimiter, sensitiveOpLimiter, createResourceLimiter };
