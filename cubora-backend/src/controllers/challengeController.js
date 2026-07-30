const Challenge = require('../models/Challenge');
const UserChallengeProgress = require('../models/UserChallengeProgress');
const SolveHistory = require('../models/SolveHistory');

// Ensure an active challenge exists in DB
const getOrCreateActiveChallenge = async () => {
  let activeChallenge = await Challenge.findOne({ isActive: true });
  if (!activeChallenge) {
    activeChallenge = await Challenge.create({
      title: 'ROUX TRANSITION WEEK',
      description: 'Complete 50 verified solves using the Roux method.',
      targetCount: 50,
      methodFilter: 'Roux',
      isActive: true
    });
  }
  return activeChallenge;
};

// @desc    Get active community challenge & current user's progress
// @route   GET /api/community/challenge/progress
// @access  Private
exports.getChallengeProgress = async (req, res) => {
  try {
    const activeChallenge = await getOrCreateActiveChallenge();
    const todayStr = new Date().toISOString().split('T')[0];

    let userProgress = await UserChallengeProgress.findOne({
      user: req.user.id,
      challenge: activeChallenge._id
    });

    if (!userProgress) {
      userProgress = await UserChallengeProgress.create({
        user: req.user.id,
        challenge: activeChallenge._id,
        completedSolvesCount: 0,
        lastUpdatedDate: todayStr,
        dailyCount: 0
      });
    } else if (userProgress.lastUpdatedDate !== todayStr) {
      userProgress.lastUpdatedDate = todayStr;
      userProgress.dailyCount = 0;
      await userProgress.save();
    }

    res.status(200).json({
      success: true,
      data: {
        challenge: {
          id: activeChallenge._id,
          title: activeChallenge.title,
          description: activeChallenge.description,
          targetCount: activeChallenge.targetCount,
          methodFilter: activeChallenge.methodFilter
        },
        progress: {
          completedSolvesCount: userProgress.completedSolvesCount,
          targetCount: activeChallenge.targetCount,
          dailyCount: userProgress.dailyCount,
          dailyLimit: 15
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Internal evaluator triggered when a solve is saved (POST /api/solves)
exports.evaluateChallengeProgress = async (userId, solve) => {
  try {
    if (!solve || !userId) return;

    // Rule 1: Live timer solves only (isManual === false)
    if (solve.isManual === true) return;

    // Rule 2: verificationStatus must be 'verified_session' or 'verified_phase'
    if (solve.verificationStatus !== 'verified_session' && solve.verificationStatus !== 'verified_phase') return;

    const activeChallenge = await getOrCreateActiveChallenge();

    // Rule 3: Solve method matches challenge requirement (if method-specific, e.g. 'Roux' or 'CFOP')
    if (activeChallenge.methodFilter && activeChallenge.methodFilter.toLowerCase() !== 'any') {
      const solveMethod = (solve.method || '').toLowerCase();
      const requiredMethod = activeChallenge.methodFilter.toLowerCase();
      if (solveMethod !== requiredMethod) return;
    }

    // Rule 4: Anti-cheat threshold - timeMs must be >= 50% of user's historical rolling average
    const previousSolves = await SolveHistory.find({
      user: userId,
      _id: { $ne: solve._id },
      isDeleted: false,
      penalty: { $ne: 'DNF' }
    });

    if (previousSolves.length > 0) {
      const times = previousSolves.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
      let rollingAvg = null;
      if (times.length >= 100) {
        const recent100 = times.slice(-100);
        const sorted = [...recent100].sort((a, b) => a - b);
        const trimCount = Math.max(1, Math.ceil(100 * 0.05));
        const trimmed = sorted.slice(trimCount, -trimCount);
        if (trimmed.length > 0) {
          rollingAvg = trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
        }
      }
      if (rollingAvg === null) {
        rollingAvg = times.reduce((a, b) => a + b, 0) / times.length;
      }

      if (rollingAvg && solve.timeMs < 0.50 * rollingAvg) {
        return; // Disqualified: solve time is less than 50% of rolling average
      }
    }

    // Rule 5: Daily Limit: Cap progress contribution to max 15 qualifying solves per day per user
    const todayStr = new Date().toISOString().split('T')[0];
    let userProgress = await UserChallengeProgress.findOne({
      user: userId,
      challenge: activeChallenge._id
    });

    if (!userProgress) {
      userProgress = new UserChallengeProgress({
        user: userId,
        challenge: activeChallenge._id,
        completedSolvesCount: 0,
        lastUpdatedDate: todayStr,
        dailyCount: 0
      });
    }

    if (userProgress.lastUpdatedDate !== todayStr) {
      userProgress.lastUpdatedDate = todayStr;
      userProgress.dailyCount = 0;
    }

    if (userProgress.dailyCount >= 15) {
      return; // Daily cap reached
    }

    userProgress.dailyCount += 1;
    userProgress.completedSolvesCount = Math.min(
      activeChallenge.targetCount,
      userProgress.completedSolvesCount + 1
    );
    await userProgress.save();
  } catch (error) {
    console.error('Non-blocking challenge evaluation error:', error.message);
  }
};
