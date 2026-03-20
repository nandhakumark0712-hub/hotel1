const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const crypto = require('crypto');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ $or: [{ googleId: profile.id }, { email: profile.emails[0].value }] });
      
      if (user) {
        if (!user.googleId) user.googleId = profile.id;
        if (!user.oauthProvider) user.oauthProvider = 'google';
        if (!user.oauthId) user.oauthId = profile.id;
        await user.save();
        return done(null, user);
      }

      user = await User.create({
        name: profile.displayName,
        email: profile.emails[0].value,
        oauthProvider: 'google',
        oauthId: profile.id,
        googleId: profile.id,
        isVerified: true,
        password: crypto.randomBytes(20).toString('hex')
      });
      
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:5000/auth/github/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails ? profile.emails[0].value : `${profile.username}@github.com`;
      let user = await User.findOne({ $or: [{ githubId: profile.id }, { email }] });

      if (user) {
        if (!user.githubId) user.githubId = profile.id;
        if (!user.oauthProvider) user.oauthProvider = 'github';
        if (!user.oauthId) user.oauthId = profile.id;
        await user.save();
        return done(null, user);
      }

      user = await User.create({
        name: profile.displayName || profile.username,
        email,
        oauthProvider: 'github',
        oauthId: profile.id,
        githubId: profile.id,
        isVerified: true,
        password: crypto.randomBytes(20).toString('hex')
      });

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => done(err, user));
});
