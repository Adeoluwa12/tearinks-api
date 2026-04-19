const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/me',                  protect, ctrl.updateMe);   // alias
router.patch('/me',                protect, ctrl.updateMe);
router.get('/:username/profile',   ctrl.getProfile);
router.post('/:id/follow',         protect, ctrl.toggleFollow);
router.get('/:id/followers',       ctrl.getFollowers);
router.get('/:id/following',       ctrl.getFollowing);

module.exports = router;
