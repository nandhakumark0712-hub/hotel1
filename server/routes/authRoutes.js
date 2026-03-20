const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword, verifyEmail, socialLogin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authLimiter, sensitiveOpLimiter } = require('../middleware/rateLimiter');
const { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validators');
const passport = require('passport');
const generateToken = require('../utils/generateToken');

router.post('/register', authLimiter, validateRegister, registerUser);
router.post('/login', authLimiter, validateLogin, loginUser);
router.post('/forgot-password', sensitiveOpLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', sensitiveOpLimiter, validateResetPassword, resetPassword);
router.get('/verify-email', verifyEmail);
router.post('/social-login', socialLogin);
router.get('/profile', protect, getUserProfile);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const userData = JSON.stringify({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      token
    });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?oauth_success=true&user=${encodeURIComponent(userData)}`);
  }
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

router.get('/github/callback', 
  passport.authenticate('github', { failureRedirect: '/login', session: false }),
  (req, res) => {
    const token = generateToken(req.user._id);
    const userData = JSON.stringify({
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      token
    });
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/login?oauth_success=true&user=${encodeURIComponent(userData)}`);
  }
);

module.exports = router;
