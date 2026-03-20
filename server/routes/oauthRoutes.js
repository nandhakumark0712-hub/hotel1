const express = require('express');
const passport = require('passport');
const generateToken = require('../utils/generateToken');
const router = express.Router();

// @desc    Google OAuth
// @route   GET /api/oauth/google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// @desc    Google OAuth Callback
// @route   GET /api/oauth/google/callback
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

// @desc    GitHub OAuth
// @route   GET /api/oauth/github
router.get('/github', passport.authenticate('github', { scope: ['user:email'], session: false }));

// @desc    GitHub OAuth Callback
// @route   GET /api/oauth/github/callback
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
