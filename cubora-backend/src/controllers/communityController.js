const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const { createNotification } = require('./notificationController');

// Helper to determine post category for dynamic notification formatting
function getPostCategory(post) {
  if (post.isPB) return 'PB';
  if (post.type === 'solve') return 'solve';
  if (post.type === 'algorithm') return 'algorithm';
  if (post.type === 'discussion') return 'discussion';
  return 'post';
}

// Helper to get relative time
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

// Transform post helper
function transformPost(post, userId) {
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
    isLikedByMe: p.likedBy?.some(id => id.toString() === userId) || false,
    timeAgo: getTimeAgo(p.createdAt),
  };
}

// Transform comment helper
function transformComment(comment, userId) {
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
    isLikedByMe: c.likedBy?.some(id => id.toString() === userId) || false,
    timeAgo: getTimeAgo(c.createdAt),
  };
}

// @desc    Get all community posts (feed), populated with author info, paginated & filtered
// @route   GET /api/community
// @access  Private
exports.getPosts = async (req, res) => {
  try {
    const { limit = 10, filter = 'all', cursor } = req.query;
    const limitNum = parseInt(limit);

    // Build filter query
    let query = {};
    if (filter === 'pb') {
      query.isPB = true;
    } else if (['cfop', 'roux', 'zz', 'beginner', 'simplified cfop', 'other'].includes(filter.toLowerCase())) {
      query['solveData.method'] = new RegExp(`^${filter}$`, 'i');
    } else if (filter !== 'all') {
      query.type = filter;
    }

    if (cursor) {
      const cursorPost = await CommunityPost.findById(cursor);
      if (cursorPost) {
        query.createdAt = { $lt: cursorPost.createdAt };
      }
    }

    const posts = await CommunityPost.find(query)
      .populate('author', 'name email username avatar')
      .sort({ createdAt: -1 })
      .limit(limitNum + 1);

    const hasMore = posts.length > limitNum;
    const resultPosts = hasMore ? posts.slice(0, limitNum) : posts;
    const nextCursor = resultPosts.length > 0 ? resultPosts[resultPosts.length - 1]._id : null;

    // Transform and inject comment count dynamically
    const transformed = await Promise.all(resultPosts.map(async (post) => {
      const transformedPost = transformPost(post, req.user.id);
      const commentCount = await Comment.countDocuments({ post: post._id });
      return {
        ...transformedPost,
        commentCount,
      };
    }));

    res.status(200).json({ 
      success: true, 
      data: transformed,
      pagination: {
        nextCursor,
        hasMore
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a new community post
// @route   POST /api/community
// @access  Private
exports.createPost = async (req, res) => {
  try {
    const { content, type, solveData, isPB } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Post content is required.' });
    }

    const post = await CommunityPost.create({
      author: req.user.id,
      content: content.trim(),
      type: type || 'discussion',
      solveData: solveData || {},
      isPB: !!isPB,
    });

    await post.populate('author', 'name email username avatar');

    const response = {
      ...transformPost(post, req.user.id),
      commentCount: 0,
    };

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update a community post
// @route   PUT /api/community/:id
// @access  Private
exports.editPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required.' });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to edit this post.' });
    }

    post.content = content.trim();
    await post.save();
    await post.populate('author', 'name email username avatar');

    const commentCount = await Comment.countDocuments({ post: post._id });
    const response = {
      ...transformPost(post, req.user.id),
      commentCount,
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
      return res.status(401).json({ success: false, error: 'Not authorized to delete this post.' });
    }

    // Delete associated comments and notifications
    await Comment.deleteMany({ post: post._id });
    await Notification.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({ success: true, message: 'Post, comments, and associated notifications deleted.' });
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
    const category = getPostCategory(post);

    if (alreadyLiked) {
      // ON UNLIKE
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId);
      post.likes = Math.max(0, post.likes - 1);
      await post.save();

      // Find existing like notification
      const existingNotif = await Notification.findOne({
        recipient: post.author,
        type: 'like',
        post: post._id
      });

      if (existingNotif) {
        if (post.likedBy.length === 0) {
          // If likes drop to 0, completely delete notification from DB so no ghost alert remains
          await Notification.findByIdAndDelete(existingNotif._id);
        } else {
          // Adjust count and update string with previous liker's name
          const User = require('../models/User');
          const remainingLikers = await User.find({ _id: { $in: post.likedBy } });
          if (remainingLikers.length > 0) {
            const lastLiker = remainingLikers[remainingLikers.length - 1];
            const othersCount = remainingLikers.length - 1;
            const newContent = othersCount > 0
              ? `${lastLiker.name} and ${othersCount} other${othersCount > 1 ? 's' : ''} liked your ${category} post!`
              : `${lastLiker.name} liked your ${category} post!`;

            existingNotif.content = newContent;
            existingNotif.sender = lastLiker._id;
            await existingNotif.save();
          } else {
            await Notification.findByIdAndDelete(existingNotif._id);
          }
        }
      }
    } else {
      // ON LIKE
      post.likedBy.push(userId);
      post.likes += 1;
      await post.save();

      // Trigger Instagram-style like aggregation (if liker is not post author)
      if (post.author.toString() !== userId) {
        const User = require('../models/User');
        const likers = await User.find({ _id: { $in: post.likedBy } });
        const latestLiker = likers.find(u => u._id.toString() === userId) || { name: req.user.name };
        const othersCount = post.likedBy.length - 1;

        const content = othersCount > 0
          ? `${latestLiker.name} and ${othersCount} other${othersCount > 1 ? 's' : ''} liked your ${category} post!`
          : `${latestLiker.name} liked your ${category} post!`;

        const existingNotif = await Notification.findOne({
          recipient: post.author,
          type: 'like',
          post: post._id
        });

        if (existingNotif) {
          existingNotif.content = content;
          existingNotif.sender = userId;
          existingNotif.unread = true;
          existingNotif.createdAt = Date.now();
          await existingNotif.save();
        } else {
          await Notification.create({
            recipient: post.author,
            sender: userId,
            type: 'like',
            title: 'New Likes',
            content,
            post: post._id
          });
        }
      }
    }

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

// @desc    Get comments for a post
// @route   GET /api/community/:postId/comments
// @access  Private
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name email username avatar')
      .sort({ createdAt: 1 });

    const transformed = comments.map(c => transformComment(c, req.user.id));
    res.status(200).json({ success: true, data: transformed });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Create a comment
// @route   POST /api/community/:postId/comments
// @access  Private
exports.createComment = async (req, res) => {
  try {
    const { content, parentId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Comment content cannot be empty.' });
    }

    const post = await CommunityPost.findById(req.params.postId);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found.' });
    }

    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user.id,
      content: content.trim(),
      parentId: parentId || null,
    });

    const category = getPostCategory(post);

    // Parse mentions: look for @username patterns in content
    const mentionRegex = /@([a-zA-Z0-9_.-]+)/g;
    let match;
    const mentionedUsernames = [];
    while ((match = mentionRegex.exec(content)) !== null) {
      mentionedUsernames.push(match[1].toLowerCase());
    }

    let hasNotifiedPostAuthor = false;

    // Notify mentioned users
    if (mentionedUsernames.length > 0) {
      const User = require('../models/User');
      const mentionedUsers = await User.find({ username: { $in: mentionedUsernames } });
      
      for (const u of mentionedUsers) {
        if (u._id.toString() !== req.user.id.toString()) {
          await createNotification({
            recipient: u._id,
            sender: req.user.id,
            type: 'mention',
            title: 'Mentioned in Comment',
            content: `@${req.user.username || req.user.name} mentioned you in a comment: '${content}'`,
            post: post._id,
            comment: comment._id
          });
          if (u._id.toString() === post.author.toString()) {
            hasNotifiedPostAuthor = true;
          }
        }
      }
    }

    // Trigger reply notifications if they weren't already notified via mention
    if (!hasNotifiedPostAuthor) {
      if (!parentId && post.author.toString() !== req.user.id.toString()) {
        await createNotification({
          recipient: post.author,
          sender: req.user.id,
          type: 'reply',
          title: 'Reply on Post',
          content: `${req.user.name} replied to your ${category} post.`,
          post: post._id,
          comment: comment._id
        });
      } else if (parentId) {
        // Direct reply to comment
        const parentComment = await Comment.findById(parentId);
        if (parentComment && parentComment.author.toString() !== req.user.id.toString()) {
          await createNotification({
            recipient: parentComment.author,
            sender: req.user.id,
            type: 'reply',
            title: 'Reply to Comment',
            content: `${req.user.name} replied to your comment.`,
            post: post._id,
            comment: comment._id
          });
        }
      }
    }

    await comment.populate('author', 'name email username avatar');

    res.status(201).json({ success: true, data: transformComment(comment, req.user.id) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Toggle like on a comment
// @route   PUT /api/community/comments/:id/like
// @access  Private
exports.toggleCommentLike = async (req, res) => {
  try {
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
        isLikedByMe: !alreadyLiked
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Edit a comment
// @route   PUT /api/community/comments/:id
// @access  Private
exports.editComment = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Content is required.' });
    }

    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to edit this comment.' });
    }

    comment.content = content.trim();
    await comment.save();
    await comment.populate('author', 'name email username avatar');

    res.status(200).json({ success: true, data: transformComment(comment, req.user.id) });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Recursively delete a comment and all of its descendants
async function deleteCommentAndDescendants(commentId, deletedIds = []) {
  deletedIds.push(commentId);
  const children = await Comment.find({ parentId: commentId });
  for (const child of children) {
    await deleteCommentAndDescendants(child._id, deletedIds);
  }
  await Comment.findByIdAndDelete(commentId);
  return deletedIds;
}

// @desc    Delete a comment and its children (recursively)
// @route   DELETE /api/community/comments/:id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ success: false, error: 'Comment not found.' });
    }

    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ success: false, error: 'Not authorized to delete this comment.' });
    }

    // Recursively delete the comment and all its descendants
    const deletedIds = [];
    await deleteCommentAndDescendants(comment._id, deletedIds);

    // Self-cleaning: Immediately delete corresponding 'reply' and 'mention' notifications linked to deleted comments
    await Notification.deleteMany({ comment: { $in: deletedIds } });

    res.status(200).json({ success: true, message: 'Comment, associated replies, and notifications deleted.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Search users for @mentions
// @route   GET /api/community/users/search
// @access  Private
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(200).json({ success: true, data: [] });
    }
    const User = require('../models/User');
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { username: { $regex: query, $options: 'i' } }
      ]
    }).limit(5).select('name username avatar email');

    const formatted = users.map(u => {
      const handle = u.username || u.email.split('@')[0];
      return {
        _id: u._id,
        name: u.name,
        handle: handle.toLowerCase().replace(/\s+/g, '_'),
        avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(u.name)}`
      };
    });

    res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

