// // auth.routes.js
// const express = require('express');
// const passport = require('passport');
// const router = express.Router();
// const ctrl = require('../controllers/auth.controller');
// const { protect } = require('../middleware/auth.middleware');

// router.post('/register', ctrl.register);
// router.post('/login',    ctrl.login);
// router.get('/me',        protect, ctrl.getMe);

// router.get('/google',
//   passport.authenticate('google', { scope: ['profile', 'email'], session: false })
// );
// router.get('/google/callback',
//   passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
//   ctrl.googleCallback
// );

// module.exports = router;


const express = require('express');
const passport = require('passport');
const router = express.Router();
const ctrl = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/register', ctrl.register);
router.post('/login',    ctrl.login);
router.get('/me',        protect, ctrl.getMe);

// New features
router.post('/forgot-password', ctrl.forgotPassword);
router.put('/reset-password/:token', ctrl.resetPassword);
router.get('/verify-email/:token', ctrl.verifyEmail);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', 
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth` }),
  ctrl.googleCallback
);

module.exports = router;