const { Collection } = require('../models/index');

// POST /api/collections
exports.createCollection = async (req, res, next) => {
  try {
    const col = await Collection.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ collection: col });
  } catch (err) { next(err); }
};

// GET /api/collections  — own collections
exports.getMyCollections = async (req, res, next) => {
  try {
    const cols = await Collection.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json({ collections: cols });
  } catch (err) { next(err); }
};

// GET /api/collections/:id
exports.getCollection = async (req, res, next) => {
  try {
    const col = await Collection.findById(req.params.id)
      .populate('owner', 'username avatar')
      .populate({ path: 'poems', populate: { path: 'author', select: 'username avatar' } });
    if (!col) return res.status(404).json({ message: 'Collection not found' });
    if (!col.isPublic && col.owner._id.toString() !== req.user?._id?.toString()) {
      return res.status(403).json({ message: 'Private collection' });
    }
    res.json({ collection: col });
  } catch (err) { next(err); }
};

// PATCH /api/collections/:id
exports.updateCollection = async (req, res, next) => {
  try {
    const col = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
    if (!col) return res.status(404).json({ message: 'Collection not found' });
    Object.assign(col, req.body);
    await col.save();
    res.json({ collection: col });
  } catch (err) { next(err); }
};

// DELETE /api/collections/:id
exports.deleteCollection = async (req, res, next) => {
  try {
    const col = await Collection.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!col) return res.status(404).json({ message: 'Collection not found' });
    res.json({ message: 'Collection deleted' });
  } catch (err) { next(err); }
};

// POST /api/collections/:id/poems
// exports.addPoem = async (req, res, next) => {
//   try {
//     const col = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
//     if (!col) return res.status(404).json({ message: 'Collection not found' });
//     if (!col.poems.includes(req.body.postId)) {
//       col.poems.push(req.body.postId);
//       await col.save();
//     }
//     res.json({ collection: col });
//   } catch (err) { next(err); }
// };

// POST /api/collections/:id/poems
exports.addPoem = async (req, res, next) => {
  try {
    const { postId } = req.body;
    
    // 1. Guard against empty postId
    if (!postId) return res.status(400).json({ message: 'postId is required' });

    const col = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
    if (!col) return res.status(404).json({ message: 'Collection not found' });

    // 2. More reliable way to check if the ID already exists in the array
    const exists = col.poems.some(id => id && id.toString() === postId);

    if (!exists) {
      col.poems.push(postId);
      await col.save();
    }

    res.json({ collection: col });
  } catch (err) { next(err); }
};

// DELETE /api/collections/:id/poems/:postId
exports.removePoem = async (req, res, next) => {
  try {
    const col = await Collection.findOne({ _id: req.params.id, owner: req.user._id });
    if (!col) return res.status(404).json({ message: 'Collection not found' });
    col.poems = col.poems.filter(p => p.toString() !== req.params.postId);
    await col.save();
    res.json({ collection: col });
  } catch (err) { next(err); }
};
