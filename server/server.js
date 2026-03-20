const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const connectDB = require('./config/db');
require('./config/passport');
const { apiLimiter, authLimiter } = require('./middleware/rateLimiter');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST']
    }
});

// Body parsers (must come before security middleware that inspects req.body)
app.use(express.json({ limit: '10kb' }));  // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── Security Middleware ──────────────────────────────────────────────────────
// Secure HTTP headers (includes strict CSP, HSTS, etc.)
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", 'data:', 'https:', 'http://localhost:*', 'ws://localhost:*'],
            connectSrc: ["'self'", 'https:', 'http://localhost:*', 'ws://localhost:*'],
        }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Workaround for Express 5 where req.query is a getter-only property
// express-mongo-sanitize attempts to reassign req.query, which throws an error
app.use((req, res, next) => {
    ['query', 'params', 'body', 'headers'].forEach((key) => {
        if (req[key]) {
            const val = req[key];
            Object.defineProperty(req, key, {
                value: val,
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
    });
    next();
});

// Sanitize user data to prevent MongoDB operator injection
app.use(mongoSanitize({
    replaceWith: '_',
    onSanitize: ({ req, key }) => {
        console.warn(`[Security] MongoDB injection attempt sanitized - key: ${key} - IP: ${req.ip}`);
    }
}));

// XSS protection — sanitize user input from POST body, GET queries, URL params
app.use(xss());

// Prevent HTTP Parameter Pollution attacks
app.use(hpp({
    whitelist: ['rating', 'price', 'amenities', 'sort'] // allow duplicate query params for these
}));

// CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// HTTP request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Global API rate limiter
app.use('/api/', apiLimiter);

app.use(passport.initialize());

// Socket.io initialization
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Client should emit 'join' with their userId after connecting
    socket.on('join', (userId) => {
        if (userId) {
            socket.join(`user_${userId}`);
            console.log(`Socket ${socket.id} joined room user_${userId}`);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Database Connection
connectDB();

// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Hotel Booking API' });
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const oauthRoutes = require('./routes/oauthRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const searchRoutes = require('./routes/searchRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/upload', uploadRoutes);

// Serve static assets for uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = { app, io };
