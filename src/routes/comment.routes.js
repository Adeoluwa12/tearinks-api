const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/:id/comments',                   protect, ctrl.addComment);
router.get('/:id/comments',                            ctrl.getComments);
router.delete('/:id/comments/:commentId',      protect, ctrl.deleteComment);

module.exports = router;
