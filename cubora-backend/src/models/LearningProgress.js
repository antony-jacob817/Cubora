const mongoose = require('mongoose');

const learningProgressSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  algorithmsLearned: [{ type: String }], // e.g., ['OLL 21', 'PLL T-Perm']
  currentLessonId: { type: String },
  modulesCompleted: [{ type: String }],
  lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LearningProgress', learningProgressSchema);