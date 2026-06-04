const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  preferredMethod: { type: String, default: 'CFOP' },
  theme: { type: String, enum: ['dark', 'light', 'system'], default: 'dark' },
  timerInspection: { type: Boolean, default: true }, // 15-second WCA inspection
  smartCubeConnected: { type: Boolean, default: false },
  accent: { type: String, enum: ['graphite', 'blue', 'purple', 'matte-black'], default: 'graphite' },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserSettings', userSettingsSchema);