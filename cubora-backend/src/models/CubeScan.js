const mongoose = require('mongoose');

const cubeScanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cubeState: { type: Object, required: true }, // 3D matrix or notation representing the scrambled state
  detectedColors: { type: Object, required: true }, // Raw vision data
  solveSteps: { type: [String], required: true }, // The generated algorithm (e.g., ["R", "U", "R'", "U'"])
  solveTimeMs: { type: Number }, // How long the engine took to calculate
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CubeScan', cubeScanSchema);