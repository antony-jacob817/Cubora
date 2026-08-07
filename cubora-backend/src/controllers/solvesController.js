const SolveHistory = require('../models/SolveHistory');
const Achievement = require('../models/Achievement');
const { evaluateAchievements } = require('./achievementsController');

// @desc    Save a new solve record
// @route   POST /api/solves
// @access  Private
exports.saveSolve = async (req, res) => {
  try {
    const { timeMs, scramble, method, penalty, phaseSplits, sessionId, comments, isManual } = req.body;

    if (!timeMs || !scramble) {
      return res.status(400).json({ success: false, error: 'Please provide timeMs and scramble' });
    }

    const isManualSolve = Boolean(isManual);
    const hasPhaseSplits = Boolean(phaseSplits && typeof phaseSplits === 'object' && Object.keys(phaseSplits).length > 0);

    let verificationStatus = 'unverified';

    if (isManualSolve) {
      verificationStatus = 'unverified';
    } else {
      // Calculate user's historical rolling average (Ao100 or global average) before marking live solve as verified
      const previousSolves = await SolveHistory.find({ 
        user: req.user.id, 
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

        // Anti-Cheat Check: If timeMs is less than 35% of historical rolling average, flag it
        if (rollingAvg && timeMs < 0.35 * rollingAvg) {
          verificationStatus = 'flagged';
        }
      }

      if (verificationStatus !== 'flagged') {
        verificationStatus = hasPhaseSplits ? 'verified_phase' : 'verified_session';
      }
    }

    const solve = await SolveHistory.create({
      user: req.user.id,
      sessionId: sessionId || 'main',
      timeMs,
      scramble,
      method: method || 'CFOP',
      penalty: penalty || 'None',
      comments: comments || '',
      isManual: isManualSolve,
      phaseSplits: phaseSplits || {},
      verificationStatus
    });

    // Check & trigger achievements automatically
    let newUnlocks = [];
    let newNotifications = [];
    try {
      const achRes = await evaluateAchievements(req.user.id, solve);
      if (achRes && achRes.newNotifications) {
        newUnlocks = achRes.newUnlocks || [];
        newNotifications = achRes.newNotifications || [];
      } else if (Array.isArray(achRes)) {
        newUnlocks = achRes;
      }
    } catch (achErr) {
      console.error('Non-blocking achievement evaluation error:', achErr.message);
    }

    // Check & trigger Personal Best (PB) notification if solve sets a new fastest time
    const solveTime = timeMs + (penalty === '+2' ? 2000 : 0);
    if (penalty !== 'DNF' && verificationStatus !== 'flagged') {
      try {
        const validPreviousSolves = await SolveHistory.find({
          user: req.user.id,
          isDeleted: false,
          verificationStatus: { $ne: 'flagged' },
          penalty: { $ne: 'DNF' },
          _id: { $ne: solve._id }
        });
        
        let isNewPB = false;
        if (validPreviousSolves.length === 0) {
          isNewPB = true;
        } else {
          const previousTimes = validPreviousSolves.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
          const minPrevious = Math.min(...previousTimes);
          if (solveTime < minPrevious) {
            isNewPB = true;
          }
        }

        if (isNewPB) {
          const { createNotification } = require('./notificationController');
          const pbNotif = await createNotification({
            recipient: req.user.id,
            user: req.user.id,
            type: 'achievement',
            title: 'NEW PERSONAL BEST!',
            content: `New PB! You completed a solve in ${(solveTime / 1000).toFixed(3)}s!`,
            unread: true,
            solve: solve._id,
            solveId: solve._id,
            createdAt: new Date()
          });
          if (pbNotif) {
            newNotifications.unshift(pbNotif);
          }
        }
      } catch (pbErr) {
        console.error('Non-blocking PB notification evaluation error:', pbErr.message);
      }
    }

    // Check & evaluate weekly challenge progress automatically
    try {
      await evaluateChallengeProgress(req.user.id, solve);
    } catch (chErr) {
      console.error('Non-blocking challenge evaluation error:', chErr.message);
    }

    res.status(201).json({
      success: true,
      data: solve,
      newUnlocks,
      newNotifications
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Helper function to evaluate solve progress against active weekly challenge
async function evaluateChallengeProgress(userId, solve) {
  try {
    const Challenge = require('../models/Challenge');
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const pastDaysOfYear = (now - startOfYear) / 86400000;
    const weekNumber = Math.ceil((pastDaysOfYear + startOfYear.getDay() + 1) / 7);
    const year = now.getFullYear();

    const activeChallenge = await Challenge.findOne({ weekNumber, year });
    if (!activeChallenge) return;

    // Validate anti-cheat and solve criteria
    if (solve.verificationStatus === 'flagged') return;

    // 1. Method check
    if (activeChallenge.methodFilter && activeChallenge.methodFilter !== 'Any') {
      const solveMethod = (solve.method || '').toUpperCase();
      const targetMethod = activeChallenge.methodFilter.toUpperCase();
      if (!solveMethod.includes(targetMethod) && !targetMethod.includes(solveMethod)) {
        return;
      }
    }

    // 2. Max time threshold check
    if (activeChallenge.maxTimeMs && solve.timeMs > activeChallenge.maxTimeMs) {
      return;
    }

    // 3. Penalty check
    if (activeChallenge.penaltyAllowed === false && solve.penalty !== 'None') {
      return;
    }

    // 4. Phase split telemetry check
    if (activeChallenge.phaseSplitRequired === true) {
      const hasSplits = solve.phaseSplits && typeof solve.phaseSplits === 'object' && Object.keys(solve.phaseSplits).length > 0;
      if (!hasSplits) return;
    }

    // Solve qualifies! Update participant progress in MongoDB
    let participant = activeChallenge.participants.find(
      p => p.user && p.user.toString() === userId.toString()
    );

    if (!participant) {
      activeChallenge.participants.push({
        user: userId,
        progressCount: 1,
        completed: 1 >= activeChallenge.targetCount,
        completedAt: 1 >= activeChallenge.targetCount ? new Date() : null
      });
    } else {
      if (!participant.completed) {
        participant.progressCount += 1;
        if (participant.progressCount >= activeChallenge.targetCount) {
          participant.completed = true;
          participant.completedAt = new Date();
        }
      }
    }

    await activeChallenge.save();
  } catch (err) {
    console.error('Non-blocking challenge progress evaluation error:', err.message);
  }
}

// @desc    Update a solve record (Apply +2, DNF, or add comments)
// @route   PUT /api/solves/:id
// @access  Private
exports.updateSolve = async (req, res) => {
  try {
    const { penalty, comments, sessionId } = req.body;
    let solve = await SolveHistory.findOne({ _id: req.params.id, user: req.user.id });

    if (!solve) {
      return res.status(404).json({ success: false, error: 'Solve record not found' });
    }

    if (penalty !== undefined) solve.penalty = penalty;
    if (comments !== undefined) solve.comments = comments;
    if (sessionId !== undefined) solve.sessionId = sessionId;

    await solve.save();
    res.status(200).json({ success: true, data: solve });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all user solves (Filtered by session, sorted by newest)
// @route   GET /api/solves
// @access  Private
exports.getSolves = async (req, res) => {
  try {
    const sessionId = req.query.sessionId || 'main';
    const query = { user: req.user.id };
    if (sessionId !== 'all') {
      query.sessionId = sessionId;
    }
    
    // We send ALL solves (even soft-deleted ones) to the frontend.
    // The frontend React code will filter out `isDeleted` for charts/tables,
    // but keep them for building the Annual Activity Heatmap.
    const solves = await SolveHistory.find(query).sort({ date: -1 });
    res.status(200).json({ success: true, count: solves.length, data: solves });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete a solve record (Soft delete to preserve streaks)
// @route   DELETE /api/solves/:id
// @access  Private
exports.deleteSolve = async (req, res) => {
  try {
    const solve = await SolveHistory.findOne({ _id: req.params.id, user: req.user.id });

    if (!solve) {
      return res.status(404).json({ success: false, error: 'Solve record not found' });
    }

    // Soft delete: Hides it from stats but keeps the footprint for streaks
    solve.isDeleted = true;
    await solve.save();
    
    // Purge corresponding notifications linked to this solve
    const Notification = require('../models/Notification');
    const userId = req.user._id || req.user.id;
    await Notification.deleteMany({
      $or: [{ solve: req.params.id }, { solveId: req.params.id }],
      $or: [{ recipient: userId }, { user: userId }]
    });

    // Recalculate/revert user achievements
    const { recalculateUserAchievements } = require('./achievementsController');
    if (typeof recalculateUserAchievements === 'function') {
      await recalculateUserAchievements(userId);
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get solver analytics and trend statistics (Filtered by session)
// @route   GET /api/solves/stats
// @access  Private
exports.getSolveStats = async (req, res) => {
  try {
    const sessionId = req.query.sessionId || 'all';
    const timeframe = req.query.timeframe || '30D';
    
    const query = { user: req.user.id };
    if (sessionId !== 'all') {
      query.sessionId = sessionId;
    }
    
    // Fetch ALL solves (including soft-deleted ones) for streak calculation
    const allHistoricalSolves = await SolveHistory.find(query).sort({ date: 1 });

    if (allHistoricalSolves.length === 0) {
      return res.status(200).json({
        success: true,
        stats: {
          pb: null,
          ao5: null,
          ao12: null,
          ao100: null,
          globalAverage: null,
          streak: 0,
          trends: []
        }
      });
    }

    // Filter out deleted solves specifically for performance math
    const activeSolves = allHistoricalSolves.filter(s => !s.isDeleted);
    const validSolves = activeSolves.filter(s => s.penalty !== 'DNF');
    
    const times = validSolves.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
    
    const pb = times.length > 0 ? Math.min(...times) : null;
    const globalAverage = times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : null;

    const calculateAoN = (solveTimes, n) => {
      if (solveTimes.length < n) return null;
      const recent = solveTimes.slice(-n);
      const sorted = [...recent].sort((a, b) => a - b);
      
      const trimCount = Math.max(1, Math.ceil(n * 0.05)); 
      const trimmed = sorted.slice(trimCount, -trimCount); 
      return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    };

    const ao5 = calculateAoN(times, 5);
    const ao12 = calculateAoN(times, 12);
    const ao100 = calculateAoN(times, 100);

    // TIME-SCALE ADAPTIVE TREND GENERATOR
    // Configures chart points safely based on the timeframe request parameters
    let lookbackDays = 7;
    if (timeframe === '30D') lookbackDays = 30;
    if (timeframe === '3M') lookbackDays = 90;
    if (timeframe === 'ALL') lookbackDays = 365;

    const trendMap = {};
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = lookbackDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      
      const label = lookbackDays <= 7 
        ? dayNames[d.getDay()] 
        : `${d.getMonth() + 1}/${d.getDate()}`;
        
      trendMap[label] = [];
    }

    // Only populate trends with valid, active solves
    validSolves.forEach(solve => {
      const solveDate = new Date(solve.date);
      const label = lookbackDays <= 7 
        ? dayNames[solveDate.getDay()] 
        : `${solveDate.getMonth() + 1}/${solveDate.getDate()}`;
        
      if (trendMap[label] !== undefined) {
        trendMap[label].push((solve.timeMs + (solve.penalty === '+2' ? 2000 : 0)) / 1000); 
      }
    });

    const trends = Object.keys(trendMap).map(key => {
      const dayTimes = trendMap[key];
      const avg = dayTimes.length > 0 ? (dayTimes.reduce((a, b) => a + b, 0) / dayTimes.length) : null;
      return {
        date: key,
        time: avg ? parseFloat(avg.toFixed(2)) : 0
      };
    });

    let streak = 0;
    const uniqueDays = new Set(allHistoricalSolves.map(s => new Date(s.date).toDateString()));
    const today = new Date();
    const hasSolvedToday = uniqueDays.has(today.toDateString());
    
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date();
      checkDate.setDate(today.getDate() - i);
      if (uniqueDays.has(checkDate.toDateString())) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    res.status(200).json({
      success: true,
      stats: {
        pb: pb ? parseFloat((pb / 1000).toFixed(3)) : null,
        ao5: ao5 ? parseFloat((ao5 / 1000).toFixed(3)) : null,
        ao12: ao12 ? parseFloat((ao12 / 1000).toFixed(3)) : null,
        ao100: ao100 ? parseFloat((ao100 / 1000).toFixed(3)) : null,
        globalAverage: globalAverage ? parseFloat((globalAverage / 1000).toFixed(3)) : null,
        streak,
        hasSolvedToday,
        trends
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
