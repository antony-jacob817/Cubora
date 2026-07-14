const CommunityPost = require('../models/CommunityPost');

// @desc    Get all community posts (feed), populated with author info
// @route   GET /api/community
// @access  Private
exports.getPosts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const before = req.query.before;
    const type = req.query.type;

    const query = {};
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }
    if (type && ['solve', 'algorithm', 'discussion'].includes(type)) {
      query.type = type;
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'name email username avatar')
      .sort({ createdAt: -1 })
      .limit(limit);

    const Comment = require('../models/Comment');

    // Transform to include author avatar, relative time, and dynamic comments count
    const transformed = await Promise.all(posts.map(async post => {
      const p = post.toObject();
      const authorName = p.author?.name || 'Anonymous';
      const authorUsername = p.author?.username || p.author?.email?.split('@')[0] || authorName;
      const authorAvatar = p.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;
      const commentsCount = await Comment.countDocuments({ post: post._id });

      return {
        ...p,
        author: {
          _id: p.author?._id,
          name: authorName,
          handle: `@${authorUsername.toLowerCase().replace(/\s+/g, '_')}`,
          avatar: authorAvatar,
        },
        isLikedByMe: p.likedBy?.some(id => id.toString() === req.user.id) || false,
        timeAgo: getTimeAgo(p.createdAt),
        commentsCount,
      };
    }));

    res.status(200).json({ success: true, data: transformed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new community post
// @route   POST /api/community
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content, type, solveData } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Post content is required.' });
    }

    const post = await CommunityPost.create({
      author: req.user.id,
      content: content.trim(),
      type: type || 'discussion',
      solveData: solveData || {},
    });

    // Populate the author before returning so the client has all the data it needs
    await post.populate('author', 'name email username avatar');

    const authorName = post.author?.name || 'Anonymous';
    const authorUsername = post.author?.username || post.author?.email?.split('@')[0] || authorName;
    const authorAvatar = post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;
    const response = {
      ...post.toObject(),
      author: {
        _id: post.author?._id,
        name: authorName,
        handle: `@${authorUsername.toLowerCase().replace(/\s+/g, '_')}`,
        avatar: authorAvatar,
      },
      isLikedByMe: false,
      timeAgo: 'Just now',
      commentsCount: 0,
    };

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a community post
// @route   PUT /api/community/:id
// @access  Private
exports.updatePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this post.' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content cannot be empty.' });
    }

    post.content = content.trim();
    await post.save();

    // Populate the author info
    await post.populate('author', 'name email username avatar');
    const authorName = post.author?.name || 'Anonymous';
    const authorUsername = post.author?.username || post.author?.email?.split('@')[0] || authorName;
    const authorAvatar = post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;
    
    const Comment = require('../models/Comment');
    const commentsCount = await Comment.countDocuments({ post: post._id });

    const response = {
      ...post.toObject(),
      author: {
        _id: post.author?._id,
        name: authorName,
        handle: `@${authorUsername.toLowerCase().replace(/\s+/g, '_')}`,
        avatar: authorAvatar,
      },
      isLikedByMe: post.likedBy?.some(id => id.toString() === req.user.id) || false,
      timeAgo: getTimeAgo(post.createdAt),
      commentsCount,
    };

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a community post
// @route   DELETE /api/community/:id
// @access  Private
exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this post.' });
    }

    // Clean up associated comments
    const Comment = require('../models/Comment');
    await Comment.deleteMany({ post: post._id });

    await post.deleteOne();
    res.status(200).json({ success: true, message: 'Post deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle like on a community post
// @route   PUT /api/community/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    const userId = req.user.id;
    const alreadyLiked = post.likedBy.some(id => id.toString() === userId);

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes += 1;
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: {
        likes: post.likes,
        isLikedByMe: !alreadyLiked,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get comments for a community post
// @route   GET /api/community/:postId/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email username avatar')
      .sort({ createdAt: 1 });

    const transformed = comments.map(comment => {
      const c = comment.toObject();
      const authorName = c.author?.name || 'Anonymous';
      const authorUsername = c.author?.username || c.author?.email?.split('@')[0] || authorName;
      const authorAvatar = c.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;

      return {
        ...c,
        author: {
          _id: c.author?._id,
          name: authorName,
          handle: `@${authorUsername.toLowerCase().replace(/\s+/g, '_')}`,
          avatar: authorAvatar,
        },
        isLikedByMe: c.likedBy?.some(id => id.toString() === req.user.id) || false,
        timeAgo: getTimeAgo(c.createdAt),
      };
    });

    res.status(200).json({ success: true, data: transformed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a comment or reply
// @route   POST /api/community/:postId/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Comment content is required.' });
    }

    const Comment = require('../models/Comment');
    const comment = await Comment.create({
      author: req.user.id,
      post: req.params.postId,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    await comment.populate('author', 'name email username avatar');

    const authorName = comment.author?.name || 'Anonymous';
    const authorUsername = comment.author?.username || comment.author?.email?.split('@')[0] || authorName;
    const authorAvatar = comment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;

    const response = {
      ...comment.toObject(),
      author: {
        _id: comment.author?._id,
        name: authorName,
        handle: `@${authorUsername.toLowerCase().replace(/\s+/g, '_')}`,
        avatar: authorAvatar,
      },
      isLikedByMe: false,
      timeAgo: 'Just now',
    };

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle like on a comment
// @route   PUT /api/community/comments/:id/like
// @access  Private
exports.toggleCommentLike = async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    const userId = req.user.id;
    const alreadyLiked = comment.likedBy.some(id => id.toString() === userId);

    if (alreadyLiked) {
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId);
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      comment.likedBy.push(userId);
      comment.likes += 1;
    }

    await comment.save();

    res.status(200).json({
      success: true,
      data: {
        likes: comment.likes,
        isLikedByMe: !alreadyLiked,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a comment
// @route   PUT /api/community/comments/:id
// @access  Private
exports.updateComment = async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to edit this comment.' });
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content cannot be empty.' });
    }

    comment.content = content.trim();
    await comment.save();

    await comment.populate('author', 'name email username avatar');
    const authorName = comment.author?.name || 'Anonymous';
    const authorUsername = comment.author?.username || comment.author?.email?.split('@')[0] || authorName;
    const authorAvatar = comment.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;

    const response = {
      ...comment.toObject(),
      author: {
        _id: comment.author?._id,
        name: authorName,
        handle: `@${authorUsername.toLowerCase().replace(/\s+/g, '_')}`,
        avatar: authorAvatar,
      },
      isLikedByMe: comment.likedBy?.some(id => id.toString() === req.user.id) || false,
      timeAgo: getTimeAgo(comment.createdAt),
    };

    res.status(200).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/community/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const Comment = require('../models/Comment');
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Unauthorized to delete this comment.' });
    }

    // Also delete child comments (replies) if this is a parent comment
    await Comment.deleteMany({ parentComment: comment._id });

    await comment.deleteOne();
    res.status(200).json({ success: true, message: 'Comment deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- HELPER ---
function getTimeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}
