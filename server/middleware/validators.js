const { validationResult, body, param, query } = require('express-validator');

// ─── Generic validation error handler ───────────────────────────────────────
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg,
            }))
        });
    }
    next();
};

// ─── Auth Validations ────────────────────────────────────────────────────────
const validateRegister = [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .isLength({ min: 2, max: 60 }).withMessage('Name must be between 2 and 60 characters')
        .escape(),
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?])/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    handleValidationErrors
];

const validateLogin = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 1 }).withMessage('Password cannot be empty'),
    handleValidationErrors
];

const validateForgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please enter a valid email')
        .normalizeEmail(),
    handleValidationErrors
];

const validateResetPassword = [
    body('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=[\]{};':"\\|,.<>/?])/)
        .withMessage('Password must contain uppercase, lowercase, a number, and a special character'),
    handleValidationErrors
];

// ─── Hotel Validations ───────────────────────────────────────────────────────
const validateCreateHotel = [
    body('name')
        .trim()
        .notEmpty().withMessage('Hotel name is required')
        .isLength({ min: 2, max: 120 }).withMessage('Hotel name must be 2–120 characters')
        .escape(),
    body('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ min: 20, max: 2000 }).withMessage('Description must be 20–2000 characters'),
    body('location.city')
        .trim()
        .notEmpty().withMessage('City is required')
        .escape(),
    body('location.address')
        .trim()
        .notEmpty().withMessage('Address is required')
        .escape(),
    handleValidationErrors
];

// ─── Review Validations ──────────────────────────────────────────────────────
const validateReview = [
    body('hotelId')
        .notEmpty().withMessage('Hotel ID is required')
        .isMongoId().withMessage('Invalid hotel ID format'),
    body('rating')
        .notEmpty().withMessage('Rating is required')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be a number between 1 and 5'),
    body('comment')
        .trim()
        .notEmpty().withMessage('Comment is required')
        .isLength({ min: 10, max: 1000 }).withMessage('Comment must be between 10 and 1000 characters')
        .escape(),
    handleValidationErrors
];

const validateManagerReply = [
    param('reviewId')
        .notEmpty().withMessage('Review ID is required')
        .isMongoId().withMessage('Invalid review ID format'),
    body('managerReply')
        .trim()
        .notEmpty().withMessage('Reply is required')
        .isLength({ min: 5, max: 1000 }).withMessage('Reply must be between 5 and 1000 characters')
        .escape(),
    handleValidationErrors
];

// ─── Booking Validations ─────────────────────────────────────────────────────
const validateCreateBooking = [
    body('hotelId')
        .notEmpty().withMessage('Hotel ID is required')
        .isMongoId().withMessage('Invalid hotel ID'),
    body('roomId')
        .notEmpty().withMessage('Room ID is required')
        .isMongoId().withMessage('Invalid room ID'),
    body('checkIn')
        .notEmpty().withMessage('Check-in date is required')
        .isISO8601().withMessage('Invalid check-in date format')
        .custom((value) => {
            const checkInDate = new Date(value);
            const today = new Date();
            checkInDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            if (checkInDate < today) {
                throw new Error('Check-in date cannot be in the past');
            }
            return true;
        }),
    body('checkOut')
        .notEmpty().withMessage('Check-out date is required')
        .isISO8601().withMessage('Invalid check-out date format')
        .custom((value, { req }) => {
            if (new Date(value) <= new Date(req.body.checkIn)) {
                throw new Error('Check-out date must be after check-in date');
            }
            return true;
        }),
    body('totalPrice')
        .notEmpty().withMessage('Total price is required')
        .isFloat({ min: 0 }).withMessage('Total price must be a positive number'),
    handleValidationErrors
];

// ─── Search Validations ──────────────────────────────────────────────────────
const validateSearch = [
    query('location')
        .optional()
        .trim()
        .isLength({ max: 100 }).withMessage('Location search is too long')
        .escape(),
    query('rating')
        .optional()
        .isFloat({ min: 0, max: 5 }).withMessage('Rating must be between 0 and 5'),
    query('limit')
        .optional()
        .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    handleValidationErrors
];

// ─── MongoDB ID params validation ────────────────────────────────────────────
const validateMongoId = (paramName = 'id') => [
    param(paramName)
        .isMongoId().withMessage(`Invalid ${paramName} format`),
    handleValidationErrors
];

module.exports = {
    validateRegister,
    validateLogin,
    validateForgotPassword,
    validateResetPassword,
    validateCreateHotel,
    validateReview,
    validateManagerReply,
    validateCreateBooking,
    validateSearch,
    validateMongoId,
    handleValidationErrors
};
