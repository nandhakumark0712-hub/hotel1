const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

// Validate Google credentials exist
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('CRITICAL ERROR: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing from environment variables.');
  // We don't crash the server, but we don't initialize the strategy either.
} else {
  passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // 1. Check if user already exists with this googleId OR email
        let user = await User.findOne({ 
          $or: [
            { googleId: profile.id }, 
            { email: profile.emails[0].value }
          ] 
        });
        
        if (user) {
          // Update existing user with googleId if they signed up traditionally
          if (!user.googleId) user.googleId = profile.id;
          if (!user.oauthProvider) user.oauthProvider = 'google';
          if (!user.oauthId) user.oauthId = profile.id;
          await user.save();
          return done(null, user);
        }

        // 2. Create new user if not found
        user = await User.create({
          name: profile.displayName,
          email: profile.emails[0].value,
          oauthProvider: 'google',
          oauthId: profile.id,
          googleId: profile.id,
          isVerified: true, // Social accounts are trusted
          password: crypto.randomBytes(20).toString('hex') // Random pass for traditional login
        });
        
        done(null, user);
      } catch (err) {
        console.error('Error in Google Strategy:', err);
        done(err, null);
      }
    }
  ));
}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
