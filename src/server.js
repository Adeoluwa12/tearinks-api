require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { initLeaderboardCron } = require('./utils/cron-leaderboard');

const PORT = process.env.PORT || 5000;

//start cron leaderboard
initLeaderboardCron();


connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Tearinks] Server running on port ${PORT} (${process.env.NODE_ENV})`);
  });
});
