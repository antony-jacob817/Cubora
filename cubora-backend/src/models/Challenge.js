const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  weekNumber: { type: Number, required: true },
  year: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  methodFilter: { 
    type: String, 
    enum: ['Roux', 'CFOP', 'ZZ', 'Beginner', 'Any'], 
    default: 'Any' 
  },
  targetCount: { type: Number, default: 50 },
  maxTimeMs: { type: Number, default: null },
  penaltyAllowed: { type: Boolean, default: true },
  phaseSplitRequired: { type: Boolean, default: false },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    progressCount: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
  }],
  createdAt: { type: Date, default: Date.now }
});

challengeSchema.index({ weekNumber: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Challenge', challengeSchema);
