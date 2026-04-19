// post.routes.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/post.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

router.post('/',         protect,      ctrl.createPost);
router.get('/',          optionalAuth, ctrl.getPosts);
router.get('/:id',       optionalAuth, ctrl.getPost);
router.delete('/:id',    protect,      ctrl.deletePost);
router.post('/:id/like', protect,      ctrl.toggleLike);

module.exports = router;
