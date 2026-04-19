const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/user.model');

// ── JWT ─────────────────────────────────────────────────────────────
passport.use(new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
  },
  async (payload, done) => {
    try {
      const user = await User.findById(payload.id).select('-password');
      return user ? done(null, user) : done(null, false);
    } catch (err) {
      return done(err, false);
    }
  }
));

// ── Google OAuth ─────────────────────────────────────────────────────
passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  process.env.GOOGLE_CALLBACK_URL,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        // Check if email already registered manually
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          await user.save();
        } else {
          user = await User.create({
            googleId:  profile.id,
            email:     profile.emails[0].value,
            username:  profile.displayName.replace(/\s+/g, '').toLowerCase() + Math.floor(Math.random() * 9999),
            avatar:    profile.photos?.[0]?.value,
            isVerified: true,
          });
        }
      }

      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));
