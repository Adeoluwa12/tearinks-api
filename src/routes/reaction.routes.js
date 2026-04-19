const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/reaction.controller');
const { protect } = require('../middleware/auth.middleware');

router.post('/:id/reaction',  protect, ctrl.react);
router.get('/:id/reactions',           ctrl.getReactions);

module.exports = router;
