const mongoose = require('mongoose');

const masteredAlgorithmSchema = new mongoose.Schema({
  algId: { type: String, required: true },
  set: { type: String, required: true },
  masteredAt: { type: Date, default: Date.now },
  reviewCount: { type: Number, default: 1 }
}, { _id: false });

const learningProgressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  completedLessons: {
    type: [String],
    default: []
  },
  masteredAlgorithms: {
    type: [masteredAlgorithmSchema],
    default: []
  },
  currentPath: {
    type: String,
    enum: ['beginner', 'simplified-cfop', 'cfop', 'roux', 'zz'],
    default: 'beginner'
  },
  lastActiveLesson: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('LearningProgress', learningProgressSchema);