const { Comment } = require('../models/index');
const Post = require('../models/post.model');
const { scoreFor } = require('../utils/score');

// POST /api/posts/:id/comments
exports.addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const comment = await Comment.create({
      post:    post._id,
      author:  req.user._id,
      content: req.body.content,
      parent:  req.body.parentId || null,
    });

    await comment.populate('author', 'username avatar');

    post.score += scoreFor('COMMENT');
    await post.save({ validateBeforeSave: false });

    res.status(201).json({ comment });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id/comments
exports.getComments = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const skip  = (page - 1) * limit;

    const comments = await Comment.find({ post: req.params.id, parent: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'username avatar');

    res.json({ comments });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id/comments/:commentId
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    next(err);
  }
};
