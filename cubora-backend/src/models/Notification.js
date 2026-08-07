const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  type: {
    type: String,
    enum: ['mention', 'reply', 'like', 'streak', 'achievement'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost'
  },
  comment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  },
  solve: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SolveHistory'
  },
  solveId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SolveHistory'
  },
  unread: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

notificationSchema.index({ recipient: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
