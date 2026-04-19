const passport = require('passport');

// Require a valid JWT — attaches req.user
const protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err)    return next(err);
    if (!user)  return res.status(401).json({ message: 'Unauthorised' });
    if (user.isBanned) return res.status(403).json({ message: 'Account suspended' });
    req.user = user;
    next();
  })(req, res, next);
};

// Optional auth — attaches req.user if token present, proceeds regardless
const optionalAuth = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (_err, user) => {
    if (user && !user.isBanned) req.user = user;
    next();
  })(req, res, next);
};

// Role guard — call after protect
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden: insufficient role' });
  }
  next();
};

module.exports = { protect, optionalAuth, requireRole };
