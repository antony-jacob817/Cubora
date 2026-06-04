const mongoose = require('mongoose');

const solveHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sessionId: { type: String, default: 'main' }, // NEW: Multi-session support
  timeMs: { type: Number, required: true }, // Solve time in milliseconds
  scramble: { type: String, required: true },
  method: { type: String, enum: ['Beginner', 'CFOP', 'Simplified CFOP', 'Roux', 'ZZ', 'Other'], default: 'CFOP' },
  penalty: { type: String, enum: ['None', '+2', 'DNF'], default: 'None' },
  comments: { type: String, default: '' }, // NEW: Solve notes/comments
  isManual: { type: Boolean, default: false }, // NEW: Tracks if time was typed manually
  phaseSplits: { // For advanced analytics (Cross, F2L, OLL, PLL)
    cross: Number,
    f2l: Number,
    oll: Number,
    pll: Number
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SolveHistory', solveHistorySchema);