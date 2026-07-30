const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  targetCount: { type: Number, default: 50 },
  methodFilter: { type: String, default: 'Roux' }, // 'Roux', 'CFOP', 'any', etc.
  startDate: { type: Date, default: Date.now },
  endDate: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
