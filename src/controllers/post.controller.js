const Post = require('../models/post.model');
const { Like } = require('../models/index');
const { scoreFor } = require('../utils/score');

// POST /api/posts
exports.createPost = async (req, res, next) => {
  try {
    const { title, content, type, videoUrl, audioUrl, tags, coAuthors } = req.body;
    const post = await Post.create({
      author: req.user._id,
      title, content, type, videoUrl, audioUrl,
      tags: tags || [],
      coAuthors: coAuthors || [],
    });
    await post.populate('author', 'username avatar');
    res.status(201).json({ post });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts  — paginated feed
exports.getPosts = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const skip  = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.tag)    filter.tags   = req.query.tag;
    if (req.query.type)   filter.type   = req.query.type.toUpperCase();
    if (req.query.author) filter.author = req.query.author;

    const sort = req.query.sort === 'top' ? { score: -1 } : { createdAt: -1 };

    const [posts, total] = await Promise.all([
      Post.find(filter).sort(sort).skip(skip).limit(limit)
          .populate('author', 'username avatar'),
      Post.countDocuments(filter),
    ]);

    res.json({ posts, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

// GET /api/posts/:id
exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username avatar bio')
      .populate('coAuthors', 'username avatar');
    if (!post) return res.status(404).json({ message: 'Post not found' });

    post.viewCount += 1;
    await post.save({ validateBeforeSave: false });

    // Is the requesting user a liker?
    let liked = false;
    if (req.user) {
      liked = !!(await Like.findOne({ post: post._id, user: req.user._id }));
    }

    res.json({ post, liked });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    await post.deleteOne();
    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
};

// POST /api/posts/:id/like  (toggle)
exports.toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    const existing = await Like.findOne({ post: post._id, user: req.user._id });
    if (existing) {
      await existing.deleteOne();
      post.likeCount  = Math.max(0, post.likeCount - 1);
      post.score      = Math.max(0, post.score - scoreFor('LIKE'));
      await post.save({ validateBeforeSave: false });
      return res.json({ liked: false, likeCount: post.likeCount });
    }

    await Like.create({ post: post._id, user: req.user._id });
    post.likeCount += 1;
    post.score     += scoreFor('LIKE');
    await post.save({ validateBeforeSave: false });
    res.json({ liked: true, likeCount: post.likeCount });
  } catch (err) {
    next(err);
  }
};
