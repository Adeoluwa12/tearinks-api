const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const rateLimit = require('express-rate-limit');

require('./config/passport');

const authRoutes       = require('./routes/auth.routes');
const userRoutes       = require('./routes/user.routes');
const postRoutes       = require('./routes/post.routes');
const commentRoutes    = require('./routes/comment.routes');
const reactionRoutes   = require('./routes/reaction.routes');
const collectionRoutes = require('./routes/collection.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');

const { errorHandler } = require('./middleware/error.middleware');

const app = express();

// ── Security ──────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
}));

// ── Middleware ─────────────────────────────────────────────────────
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(passport.initialize());

// ── Routes ─────────────────────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/posts',       postRoutes);
app.use('/api/posts',       commentRoutes);
app.use('/api/posts',       reactionRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Error handler (must be last) ───────────────────────────────────
app.use(errorHandler);

module.exports = app;
