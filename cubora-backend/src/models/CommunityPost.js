const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  content: { 
    type: String, 
    required: true, 
    maxlength: 2000 
  },
  type: { 
    type: String, 
    enum: ['solve', 'algorithm', 'discussion'], 
    default: 'discussion' 
  },
  solveData: {
    time: String,
    method: String,
    scramble: String,
    alg: String,
    algType: String,
  },
  likes: { type: Number, default: 0 },
  likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// Index for efficient feed queries (newest first)
communityPostSchema.index({ createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
