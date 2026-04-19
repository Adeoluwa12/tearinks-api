const { Reaction } = require('../models/index');
const Post = require('../models/post.model');
const { scoreFor } = require('../utils/score');

// POST /api/posts/:id/reaction
exports.react = async (req, res, next) => {
  try {
    const { type } = req.body;
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existing = await Reaction.findOne({ post: post._id, user: req.user._id });

    if (existing) {
      if (existing.type === type) {
        // Remove reaction
        post.score = Math.max(0, post.score - scoreFor(existing.type));
        await existing.deleteOne();
        await post.save({ validateBeforeSave: false });
        return res.json({ reaction: null });
      }
      // Swap reaction
      post.score = Math.max(0, post.score - scoreFor(existing.type));
      existing.type = type;
      await existing.save();
      post.score += scoreFor(type);
      await post.save({ validateBeforeSave: false });
      return res.json({ reaction: existing });
    }

    const reaction = await Reaction.create({ post: post._id, user: req.user._id, type });
    post.score += scoreFor(type);
    await post.save({ validateBeforeSave: false });
    res.status(201).json({ reaction });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id/reactions
exports.getReactions = async (req, res, next) => {
  try {
    const reactions = await Reaction.find({ post: req.params.id });
    const summary = { DEEP: 0, POWERFUL: 0, CALM: 0, RAW: 0 };
    reactions.forEach(r => { summary[r.type] = (summary[r.type] || 0) + 1; });
    res.json({ summary, total: reactions.length });
  } catch (err) {
    next(err);
  }
};
