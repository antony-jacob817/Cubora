const mongoose = require('mongoose');

const userChallengeProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  challenge: { type: mongoose.Schema.Types.ObjectId, ref: 'Challenge', required: true },
  completedSolvesCount: { type: Number, default: 0 },
  dailyCount: { type: Number, default: 0 },
  lastSolveDate: { type: Date, default: Date.now },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

userChallengeProgressSchema.index({ user: 1, challenge: 1 }, { unique: true });

module.exports = mongoose.model('UserChallengeProgress', userChallengeProgressSchema);
