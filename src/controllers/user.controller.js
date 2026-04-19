const User = require('../models/user.model');
const Post = require('../models/post.model');

// GET /api/users/:username
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password -googleId -__v');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const postCount = await Post.countDocuments({ author: user._id, isPublished: true });
    res.json({ user, postCount });
  } catch (err) { next(err); }
};

// PATCH /api/users/me
exports.updateMe = async (req, res, next) => {
  try {
    const allowed = ['username', 'bio', 'avatar'];
    const updates = {};
    allowed.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ user: user.toPublicJSON() });
  } catch (err) { next(err); }
};

// POST /api/users/:id/follow  (toggle)
exports.toggleFollow = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ message: 'User not found' });

    const isFollowing = req.user.following.includes(target._id);
    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: target._id } });
      await User.findByIdAndUpdate(target._id,   { $pull: { followers: req.user._id } });
      return res.json({ following: false });
    }
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: target._id } });
    await User.findByIdAndUpdate(target._id,   { $addToSet: { followers: req.user._id } });
    res.json({ following: true });
  } catch (err) { next(err); }
};

// GET /api/users/:id/followers
exports.getFollowers = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username avatar bio');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ followers: user.followers });
  } catch (err) { next(err); }
};

// GET /api/users/:id/following
exports.getFollowing = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username avatar bio');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ following: user.following });
  } catch (err) { next(err); }
};
