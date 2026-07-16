const Notification = require('../models/Notification');
const CommunityPost = require('../models/CommunityPost');

exports.getNotifications = async (req, res, next) => {
  try {
    // Dynamically check and generate streak warnings if needed
    try {
      const SolveHistory = require('../models/SolveHistory');
      const solves = await SolveHistory.find({ user: req.user.id, isDeleted: false }).sort({ date: 1 });
      const uniqueDays = new Set(solves.map(s => new Date(s.date).toDateString()));
      const todayStr = new Date().toDateString();
      const solvedToday = uniqueDays.has(todayStr);

      if (!solvedToday) {
        // Calculate current streak
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const checkDate = new Date();
          checkDate.setDate(today.getDate() - i);
          if (uniqueDays.has(checkDate.toDateString())) {
            currentStreak++;
          } else if (i > 0) {
            break;
          }
        }

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const existingStreakNotification = await Notification.findOne({
          recipient: req.user.id,
          type: 'streak',
          createdAt: { $gte: startOfToday }
        });

        if (!existingStreakNotification) {
          const streakText = currentStreak > 0 
            ? `Don't lose your Consistency Grind! Complete one verified solve today to keep your ${currentStreak}-day streak alive.`
            : `Don't lose your Consistency Grind! Complete one verified solve today to start your streak.`;

          await Notification.create({
            recipient: req.user.id,
            type: 'streak',
            title: 'Consistency Grind!',
            content: streakText,
            unread: true
          });
        }
      }
    } catch (streakErr) {
      console.error('Failed to run dynamic streak warning check:', streakErr);
    }

    const notifications = await Notification.find({ recipient: req.user.id })
      .populate('sender', 'username name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications
    });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    notification.unread = !notification.unread;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, unread: true },
      { $set: { unread: false } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (err) {
    next(err);
  }
};

// Helper function to create/update notifications (for internal use by other controllers)
exports.createNotification = async ({ recipient, sender, type, title, content, post }) => {
  try {
    // Check if recipient is the same as sender (don't notify oneself)
    if (recipient && sender && recipient.toString() === sender.toString()) {
      return null;
    }

    // For batched likes:
    if (type === 'like' && post) {
      const existing = await Notification.findOne({ recipient, type: 'like', post, unread: true });
      if (existing) {
        const dbPost = await CommunityPost.findById(post).populate('likedBy', 'name');
        if (dbPost && dbPost.likedBy.length > 0) {
          const firstLikerName = dbPost.likedBy[dbPost.likedBy.length - 1].name;
          const othersCount = dbPost.likedBy.length - 1;
          
          let newContent = '';
          if (othersCount > 0) {
            newContent = `${firstLikerName} and ${othersCount} other${othersCount > 1 ? 's' : ''} liked your post!`;
          } else {
            newContent = `${firstLikerName} liked your post!`;
          }
          
          existing.content = newContent;
          existing.sender = sender;
          existing.createdAt = Date.now();
          await existing.save();
          return existing;
        }
      }
    }

    // Default: create a new notification
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      content,
      post
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err);
    return null;
  }
};
