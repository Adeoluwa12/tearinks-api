const User = require('../models/user.model');
const { sendToken, signToken } = require('../utils/token');

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });
    sendToken(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    if (user.isBanned) return res.status(403).json({ message: 'Account suspended' });
    sendToken(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ user: req.user.toPublicJSON() });
};

// GET /api/auth/google/callback  — passport already ran, user on req
exports.googleCallback = (req, res) => {
  const token = signToken(req.user._id);
  // Redirect to frontend with token in query (frontend stores it)
  res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`);
};
