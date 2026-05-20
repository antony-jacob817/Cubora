const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeId: { type: String, required: true }, // e.g., 'sub-20-solve', '100-days-streak'
  title: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Achievement', achievementSchema);