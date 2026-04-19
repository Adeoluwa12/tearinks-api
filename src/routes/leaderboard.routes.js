const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/leaderboard.controller');
const { runLeaderboardUpdate } = require('../utils/cron-leaderboard');

router.get('/',          ctrl.getLeaderboard);
router.get('/top-poems', ctrl.getTopPoems);


// Add this temporary testing route
router.post('/refresh', async (req, res) => {
  try {
    await runLeaderboardUpdate();
    res.json({ message: "Leaderboard calculation successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
