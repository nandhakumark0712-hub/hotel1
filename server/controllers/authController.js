const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/emailService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { verifyEmailTemplate, resetPasswordTemplate } = require('../utils/emailTemplates');
const { createNotification } = require('../utils/notificationService');
 
const getIO = () => {
    try { return require('../server').io; } catch { return null; }
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res) => {
    console.log('Register attempt:', req.body);
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'customer',
            isVerified: false
        });

        if (user) {
            // Generate verification token using JWT
            const verificationToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
            user.verificationToken = verificationToken;
            await user.save({ validateBeforeSave: false });

            // Send verification email
            const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${verificationToken}`;
            try {
                await sendEmail({
                    to: user.email,
                    subject: 'Verify Your Email to Activate Your Account',
                    html: verifyEmailTemplate(verifyUrl)
                });
            } catch (error) {
                console.error('Email sending failed:', error);
                // We still let them register, just log error for dev
            }

            res.status(201).json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                token: generateToken(user._id),
                message: 'Registration successful! Please check your email to verify your account.'
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email }).select('+password');

        if (user && (await user.comparePassword(password))) {
            if (user.accountStatus === 'blocked') {
                return res.status(403).json({ success: false, message: 'Your account has been blocked. Please contact support.' });
            }

            // Optional: Block login if not verified (Currently omitted unless strictly wanted)
            if (!user.isVerified) {
                // return res.status(401).json({ success: false, message: 'Please verify your email first.' });
            }

            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                token: generateToken(user._id)
            });
 
            // ── Notification: Login Security Alert ────────────────────────────
            try {
                await createNotification(getIO(), {
                    userId: user._id.toString(),
                    type: 'LOGIN',
                    message: `Security alert: Your account was just logged in to. If this wasn't you, please change your password.`,
                    userEmail: user.email,
                    userName: user.name,
                    metadata: {
                        loginTime: new Date().toLocaleString('en-IN'),
                        ip: req.ip
                    }
                });
            } catch (notifErr) {
                console.error('[AuthController] Login notification failed:', notifErr.message);
            }
            // ─────────────────────────────────────────────────────────────────
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified
            });
        } else {
            res.status(404).json({ success: false, message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate JWT reset token
        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
        
        user.resetToken = resetToken;
        user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins expiry for DB checking
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

        try {
            await sendEmail({
                to: user.email,
                subject: 'Password Reset Request',
                html: resetPasswordTemplate(resetUrl)
            });
            res.status(200).json({ success: true, message: 'Password reset link sent to your email.' });
        } catch (err) {
            console.error('Failed to send reset email:', err);
            user.resetToken = undefined;
            user.resetTokenExpiry = undefined;
            await user.save({ validateBeforeSave: false });
            res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res) => {
    const { token, password } = req.body;

    try {
        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        const user = await User.findOne({
            _id: decoded.id,
            resetToken: token,
            resetTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }

        // bcrypt hashing is handled via User model pre-save hook
        user.password = password;
        user.resetToken = undefined;
        user.resetTokenExpiry = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password successfully reset.',
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email
// @access  Public
exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ success: false, message: 'No verification token provided' });
    }

    try {
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ success: false, message: 'Verification link invalid or expired' });
        }

        const user = await User.findOne({
            _id: decoded.id,
            verificationToken: token
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid verification token' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully! Your account is now active.' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Social Login
// @route   POST /api/auth/social-login
// @access  Public
exports.socialLogin = async (req, res) => {
    const { name, email, googleId, profileImage } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            if (googleId && !user.googleId) user.googleId = googleId;
                await user.save();
        } else {
            user = await User.create({
                name,
                email,
                googleId,
                profileImage,
                isVerified: true, // Social accounts are usually verified
                password: crypto.randomBytes(20).toString('hex') 
            });
        }

        res.status(200).json({
            success: true,
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token: generateToken(user._id)
        });
 
        // ── Notification: Google Login Alert ───────────────────────────
        try {
            await createNotification(getIO(), {
                userId: user._id.toString(),
                type: 'LOGIN',
                message: `Security alert: Your account was just accessed via Google Login.`,
                userEmail: user.email,
                userName: user.name,
                metadata: {
                    loginTime: new Date().toLocaleString('en-IN'),
                    ip: req.ip
                }
            });
        } catch (notifErr) {
            console.error('[AuthController] Social Login notification failed:', notifErr.message);
        }
        // ───────────────────────────────────────────────────────────────
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
