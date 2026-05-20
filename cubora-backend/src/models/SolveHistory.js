const mongoose = require('mongoose');

const solveHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timeMs: { type: Number, required: true }, // Solve time in milliseconds
  scramble: { type: String, required: true },
  method: { type: String, enum: ['Beginner', 'CFOP', 'Roux', 'ZZ', 'Other'], default: 'CFOP' },
  penalty: { type: String, enum: ['None', '+2', 'DNF'], default: 'None' },
  phaseSplits: { // For advanced analytics (Cross, F2L, OLL, PLL)
    cross: Number,
    f2l: Number,
    oll: Number,
    pll: Number
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SolveHistory', solveHistorySchema);