const mongoose = require('mongoose');

// ── Comment ─────────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema(
  {
    post:    { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    author:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 1000 },
    parent:  { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null },
  },
  { timestamps: true }
);
commentSchema.index({ post: 1, createdAt: 1 });
const Comment = mongoose.model('Comment', commentSchema);

// ── Reaction ────────────────────────────────────────────────────────
const reactionSchema = new mongoose.Schema(
  {
    post:   { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type:   { type: String, enum: ['DEEP', 'POWERFUL', 'CALM', 'RAW'], required: true },
  },
  { timestamps: true }
);
reactionSchema.index({ post: 1, user: 1 }, { unique: true });
const Reaction = mongoose.model('Reaction', reactionSchema);

// ── Like (simple toggle, separate from reactions) ────────────────────
const likeSchema = new mongoose.Schema(
  {
    post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);
likeSchema.index({ post: 1, user: 1 }, { unique: true });
const Like = mongoose.model('Like', likeSchema);

// ── Collection ──────────────────────────────────────────────────────
const collectionSchema = new mongoose.Schema(
  {
    owner:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title:       { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, maxlength: 500, default: '' },
    coverImage:  { type: String, default: null },
    isPublic:    { type: Boolean, default: true },
    poems:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  },
  { timestamps: true }
);
collectionSchema.index({ owner: 1 });
const Collection = mongoose.model('Collection', collectionSchema);

// ── Leaderboard ─────────────────────────────────────────────────────
const leaderboardSchema = new mongoose.Schema(
  {
    user:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    points: { type: Number, default: 0 },
    week:   { type: String, required: true },  // e.g. "2024-W28"
    rank:   { type: Number },
    badge:  { type: String, enum: ['TOP_POET', 'RISING_POET', 'MOST_ENGAGING', null], default: null },
  },
  { timestamps: true }
);
leaderboardSchema.index({ week: 1, points: -1 });
leaderboardSchema.index({ week: 1, user: 1 }, { unique: true });
const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

module.exports = { Comment, Reaction, Like, Collection, Leaderboard };
