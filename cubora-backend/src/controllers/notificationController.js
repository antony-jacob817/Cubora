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
          const title = currentStreak > 0 ? 'CONSISTENCY GRIND!' : 'START YOUR GRIND!';
          const streakText = currentStreak > 0 
            ? `Don't lose your Consistency Grind! Complete one verified solve in the next 3 hours to keep your ${currentStreak}-day streak alive.`
            : `Start your Consistency Grind! Complete your first verified solve today to begin your streak.`;

          await Notification.create({
            recipient: req.user.id,
            type: 'streak',
            title,
            content: streakText,
            unread: true
          });
        }
      }
    } catch (streakErr) {
      console.error('Failed to run dynamic streak warning check:', streakErr);
    }

    const userId = req.user._id || req.user.id;
    const notifications = await Notification.find({
      $or: [{ recipient: userId }, { user: userId }]
    })
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
    const userId = req.user._id || req.user.id;
    const notification = await Notification.findOne({
      _id: req.params.id,
      $or: [{ recipient: userId }, { user: userId }]
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
    const userId = req.user._id || req.user.id;
    await Notification.updateMany(
      { $or: [{ recipient: userId }, { user: userId }], unread: true },
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
exports.createNotification = async ({ recipient, user, sender, type, title, content, post, comment, solve, solveId, unread = true }) => {
  try {
    const targetUser = recipient || user;
    // Check if recipient is the same as sender (don't notify oneself)
    if (targetUser && sender && targetUser.toString() === sender.toString()) {
      return null;
    }



    // Default: create a new notification
    const notification = await Notification.create({
      recipient: targetUser,
      user: targetUser,
      sender,
      type,
      title,
      content,
      post,
      comment,
      solve: solve || solveId,
      solveId: solveId || solve,
      unread
    });
    return notification;
  } catch (err) {
    console.error('Failed to create notification in MongoDB database:', err);
    throw err;
  }
};
