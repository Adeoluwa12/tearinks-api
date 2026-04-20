// const User = require('../models/user.model');
// const { sendToken, signToken } = require('../utils/token');

// // POST /api/auth/register
// exports.register = async (req, res, next) => {
//   try {
//     const { username, email, password } = req.body;
//     const user = await User.create({ username, email, password });
//     sendToken(user, 201, res);
//   } catch (err) {
//     next(err);
//   }
// };

// // POST /api/auth/login
// exports.login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email }).select('+password');
//     if (!user || !user.password) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }
//     const match = await user.comparePassword(password);
//     if (!match) return res.status(401).json({ message: 'Invalid credentials' });
//     if (user.isBanned) return res.status(403).json({ message: 'Account suspended' });
//     sendToken(user, 200, res);
//   } catch (err) {
//     next(err);
//   }
// };

// // GET /api/auth/me
// exports.getMe = async (req, res) => {
//   res.json({ user: req.user.toPublicJSON() });
// };

// // GET /api/auth/google/callback  — passport already ran, user on req
// exports.googleCallback = (req, res) => {
//   const token = signToken(req.user._id);
//   // Redirect to frontend with token in query (frontend stores it)
//   res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
// };



const User = require('../models/user.model');
const { sendToken, signToken } = require('../utils/token');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    
    const token = user.generateToken('verify');
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email/${token}`;
    
    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your Tearinks account',
        message: `Welcome to Tearinks! Please verify your email by clicking: ${verifyUrl}`,
      });
    } catch (err) { console.error("Email failed to send"); }

    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ message: 'Account suspended' });

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const token = user.generateToken('reset');
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message: `Reset your password here: ${resetUrl}`,
      });
      res.json({ message: 'Reset email sent' });
    } catch (err) {
      console.error("NODEMAILER ERROR:", err);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Email could not be sent' });
    }
  } catch (err) { next(err); }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      resetPasswordToken: hashed,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      verifyToken: hashed,
      verifyExpire: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Token invalid or expired' });

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ message: 'Email verified' });
  } catch (err) { next(err); }
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

exports.googleCallback = (req, res) => {
  const token = signToken(req.user._id);
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};