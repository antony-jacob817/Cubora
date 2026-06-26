const Achievement = require('../models/Achievement');
const SolveHistory = require('../models/SolveHistory');

// BADGE METADATA LIST (to return status of both locked & unlocked badges)
const ALL_BADGES = [
  { id: 'first-solve', title: 'First Contact', description: 'Complete your first cube solve on Cubora.', icon: 'Sparkles', category: 'Milestone' },
  { id: 'sub-30-solve', title: 'Sub-30 Pioneer', description: 'Achieve a solve time under 30 seconds.', icon: 'Zap', category: 'Speed' },
  { id: 'sub-20-solve', title: 'Sub-20 Expert', description: 'Achieve a solve time under 20 seconds.', icon: 'Flame', category: 'Speed' },
  { id: 'sub-10-solve', title: 'Elite Speedcuber', description: 'Achieve a solve time under 10 seconds.', icon: 'Trophy', category: 'Speed' },
  { id: '50-solves-milestone', title: 'Century Halfway', description: 'Accumulate 50 validated solves.', icon: 'Target', category: 'Volume' },
  { id: '100-solves-milestone', title: 'Centurion Solver', description: 'Accumulate 100 validated solves.', icon: 'Crown', category: 'Volume' },
];

// @desc    Get all user achievements (locked & unlocked status)
// @route   GET /api/achievements
// @access  Private
exports.getAchievements = async (req, res) => {
  try {
    const unlocked = await Achievement.find({ user: req.user.id });
    const unlockedIds = new Set(unlocked.map(a => a.badgeId));

    const totalSolves = await SolveHistory.countDocuments({ user: req.user.id });

    const achievementsList = ALL_BADGES.map(badge => {
      const unlockedRecord = unlocked.find(a => a.badgeId === badge.id);
      return {
        ...badge,
        isUnlocked: unlockedIds.has(badge.id),
        unlockedAt: unlockedRecord ? unlockedRecord.unlockedAt : null,
        progress: badge.id === 'first-solve' ? Math.min(totalSolves, 1) :
                  badge.id === '50-solves-milestone' ? Math.min(totalSolves, 50) :
                  badge.id === '100-solves-milestone' ? Math.min(totalSolves, 100) : 0,
        progressTarget: badge.id === 'first-solve' ? 1 :
                        badge.id === '50-solves-milestone' ? 50 :
                        badge.id === '100-solves-milestone' ? 100 : 0
      };
    });

    res.status(200).json({ success: true, data: achievementsList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
exports.evaluateAchievements = async (userId, latestSolveTimeMs, totalSolvesCount) => {
  try {
    // Get currently unlocked achievements to avoid duplicates
    const unlocked = await Achievement.find({ user: userId });
    const unlockedIds = new Set(unlocked.map(a => a.badgeId));
    const newUnlocks = [];

    const checkAndAward = async (badgeId) => {
      if (!unlockedIds.has(badgeId)) {
        const badgeDef = ALL_BADGES.find(b => b.id === badgeId);
        if (badgeDef) {
          await Achievement.create({
            user: userId,
            badgeId: badgeId,
            title: badgeDef.title
          });
          newUnlocks.push(badgeDef);
        }
      }
    };

    // 1. Check Volume Milestones
    if (totalSolvesCount >= 1) await checkAndAward('first-solve');
    if (totalSolvesCount >= 50) await checkAndAward('50-solves-milestone');
    if (totalSolvesCount >= 100) await checkAndAward('100-solves-milestone');

    // 2. Check Speed Milestones (Convert ms to seconds)
    const timeSec = latestSolveTimeMs / 1000;
    if (timeSec < 30) await checkAndAward('sub-30-solve');
    if (timeSec < 20) await checkAndAward('sub-20-solve');
    if (timeSec < 10) await checkAndAward('sub-10-solve');

    return newUnlocks; // Returns array of newly unlocked badges so the frontend can show a popup!
  } catch (error) {
    console.error('Achievement Evaluation Error:', error);
    return [];
  }
};