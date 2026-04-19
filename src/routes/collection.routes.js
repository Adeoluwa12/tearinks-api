const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/collection.controller');
const { protect, optionalAuth } = require('../middleware/auth.middleware');

router.post('/',                          protect,      ctrl.createCollection);
router.get('/',                           protect,      ctrl.getMyCollections);
router.get('/:id',                        optionalAuth, ctrl.getCollection);
router.patch('/:id',                      protect,      ctrl.updateCollection);
router.delete('/:id',                     protect,      ctrl.deleteCollection);
router.post('/:id/poems',                 protect,      ctrl.addPoem);
router.delete('/:id/poems/:postId',       protect,      ctrl.removePoem);

module.exports = router;
