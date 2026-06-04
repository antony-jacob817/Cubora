const mongoose = require('mongoose');

// Helper to strictly define the allowed topological mapping values
const FaceStickerSchema = [{ 
  type: String, 
  enum: ['W', 'Y', 'G', 'B', 'R', 'O', 'UNKNOWN'] 
}];

const cubeScanSchema = new mongoose.Schema({
  user: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true,
    index: true 
  },
  cubeState: {
    // Hardened structural mapping for the 54-element layout
    F: FaceStickerSchema,
    R: FaceStickerSchema,
    B: FaceStickerSchema,
    L: FaceStickerSchema,
    U: FaceStickerSchema,
    D: FaceStickerSchema
  }, 
  detectedColors: { 
    type: mongoose.Schema.Types.Mixed, 
    required: true 
  }, // Raw vision data passthrough
  solveSteps: { 
    type: [String], 
    required: true 
  }, // The generated algorithm (e.g., ["R", "U", "R'", "U'"])
  solveTimeMs: { 
    type: Number,
    min: 0
  }, // How long the engine took to calculate
  createdAt: { 
    type: Date, 
    default: Date.now,
    index: true
  }
});

module.exports = mongoose.model('CubeScan', cubeScanSchema);