const CommunityPost = require('../models/CommunityPost');

// @desc    Get all community posts (feed), populated with author info
// @route   GET /api/community
// @access  Private
exports.getPosts = async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate('author', 'name email username avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    // Transform to include author avatar and relative time
    const transformed = posts.map(post => {
      const p = post.toObject();
      const authorName = p.author?.name || 'Anonymous';
      const authorUsername = p.author?.username || p.author?.email?.split('@')[0] || authorName;
      const authorAvatar = p.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authorName)}`;
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
      };
    });

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
    };

    res.status(201).json({ success: true, data: response });
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
