const { Leaderboard } = require('../models/index');
const Post = require('../models/post.model');

// Utility: ISO week string e.g. "2024-W28"
const getWeekString = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

// GET /api/leaderboard?week=current
exports.getLeaderboard = async (req, res, next) => {
  try {
    const week = req.query.week === 'current' || !req.query.week
      ? getWeekString()
      : req.query.week;

    const entries = await Leaderboard.find({ week })
      .sort({ points: -1 })
      .limit(50)
      .populate('user', 'username avatar bio');

    res.json({ week, entries });
  } catch (err) { next(err); }
};

// GET /api/leaderboard/top-poems
exports.getTopPoems = async (req, res, next) => {
  try {
    const posts = await Post.find({ isPublished: true })
      .sort({ score: -1 })
      .limit(10)
      .populate('author', 'username avatar');
    res.json({ posts });
  } catch (err) { next(err); }
};
