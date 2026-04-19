const cron = require('node-cron');
const Post = require('../models/post.model'); // Adjust path if necessary
const Comment = require('../models/index').Comment; 
const Leaderboard = require('../models/index').Leaderboard; 
const User = require('../models/user.model');



const getWeekString = (date = new Date()) => {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
};

const runLeaderboardUpdate = async () => {
  try {
    const week = getWeekString();
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - (now.getDay() || 7) + 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // 1. Get points from posts (Engagement Received)
    const postScores = await Post.aggregate([
      { $match: { createdAt: { $gte: startOfWeek }, isPublished: true } },
      { $group: { _id: '$author', points: { $sum: '$score' } } }
    ]);

    // 2. Get points from comments made (Engagement Given)
    const commentCounts = await Comment.aggregate([
      { $match: { createdAt: { $gte: startOfWeek } } },
      { $group: { _id: '$author', count: { $sum: 1 } } }
    ]);

    const userMap = new Map();

    postScores.forEach(p => {
      userMap.set(p._id.toString(), { points: p.points, engagementGiven: 0 });
    });

    commentCounts.forEach(c => {
      const id = c._id.toString();
      const existing = userMap.get(id) || { points: 0, engagementGiven: 0 };
      // Adding 5 points for every comment they left to encourage activity
      userMap.set(id, { 
        points: existing.points + (c.count * 5), 
        engagementGiven: c.count 
      });
    });

    // 3. Sort by total points for Ranking
    const sorted = [...userMap.entries()].sort((a, b) => b[1].points - a[1].points);

    // 4. Identify the Most Engaging (highest engagementGiven)
    const mostEngagingId = [...userMap.entries()]
      .sort((a, b) => b[1].engagementGiven - a[1].engagementGiven)[0]?.[0];

    // 5. Upsert into DB
    for (let i = 0; i < sorted.length; i++) {
      const [userId, stats] = sorted[i];
      const rank = i + 1;
      let badge = null;

      // Priority Logic: Top Poet > Most Engaging
      if (rank === 1) {
        badge = 'TOP_POET';
      } else if (userId === mostEngagingId) {
        badge = 'MOST_ENGAGING';
      }

      await Leaderboard.findOneAndUpdate(
        { user: userId, week: week },
        { points: stats.points, rank, badge },
        { upsert: true }
      );
    }
    console.log(`[Cron] Leaderboard updated for ${week}`);
  } catch (err) {
    console.error('[Cron Error]', err);
  }
};

// Schedule: Runs every night at midnight
const initLeaderboardCron = () => {
  cron.schedule('0 0 * * *', () => {
    runLeaderboardUpdate();
  });
  console.log('[Cron] Leaderboard scheduler initialized');
};

module.exports = { initLeaderboardCron, runLeaderboardUpdate };