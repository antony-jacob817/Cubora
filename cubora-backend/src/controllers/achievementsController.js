const Achievement = require('../models/Achievement');
const SolveHistory = require('../models/SolveHistory');
const CubeScan = require('../models/CubeScan');
const User = require('../models/User');
const mongoose = require('mongoose');

// BADGE METADATA GROUPS & TIERS
const BADGE_GROUPS = [
  {
    group: 'solves-marathon',
    title: 'Solves Marathon',
    category: 'Volume',
    description: 'Total verified speedcubing solves registered on your account.',
    icon: 'Target',
    tiers: [
      { name: 'Bronze', target: 10 },
      { name: 'Silver', target: 50 },
      { name: 'Gold', target: 100 },
      { name: 'Emerald', target: 500 },
      { name: 'Diamond', target: 1000 },
      { name: 'Ruby', target: 5000 }
    ]
  },
  {
    group: 'speed-frontier',
    title: 'Speed Frontier',
    category: 'Speed',
    description: 'Break through overall single-solve time benchmarks.',
    icon: 'Trophy',
    tiers: [
      { name: 'Bronze', target: 45, label: 'Sub-45s' },
      { name: 'Silver', target: 30, label: 'Sub-30s' },
      { name: 'Gold', target: 20, label: 'Sub-20s' },
      { name: 'Emerald', target: 15, label: 'Sub-15s' },
      { name: 'Diamond', target: 10, label: 'Sub-10s' },
      { name: 'Ruby', target: 5, label: 'Sub-5s' }
    ]
  },
  {
    group: 'consistency-grind',
    title: 'Consistency Grind',
    category: 'Milestone',
    description: 'Maintain a consecutive daily practice streak.',
    icon: 'Flame',
    tiers: [
      { name: 'Bronze', target: 3, label: '3 Days' },
      { name: 'Silver', target: 7, label: '7 Days' },
      { name: 'Gold', target: 14, label: '14 Days' },
      { name: 'Emerald', target: 30, label: '30 Days' },
      { name: 'Diamond', target: 100, label: '100 Days' },
      { name: 'Ruby', target: 365, label: '365 Days' }
    ]
  },
  {
    group: 'fingertrick-maestro',
    title: 'Fingertrick Maestro',
    category: 'Speed',
    description: 'Reach maximum turning speed, measured in Turns Per Second (TPS).',
    icon: 'Timer',
    tiers: [
      { name: 'Bronze', target: 2.0, label: '2.0 TPS' },
      { name: 'Silver', target: 3.5, label: '3.5 TPS' },
      { name: 'Gold', target: 5.0, label: '5.0 TPS' },
      { name: 'Emerald', target: 6.5, label: '6.5 TPS' },
      { name: 'Diamond', target: 8.0, label: '8.0 TPS' },
      { name: 'Ruby', target: 10.0, label: '10.0 TPS' }
    ]
  },
  {
    group: 'session-marathoner',
    title: 'Session Marathoner',
    category: 'Volume',
    description: 'Complete a high number of solves within a single continuous practice session.',
    icon: 'Clock',
    tiers: [
      { name: 'Bronze', target: 10, label: '10 Solves' },
      { name: 'Silver', target: 25, label: '25 Solves' },
      { name: 'Gold', target: 50, label: '50 Solves' },
      { name: 'Emerald', target: 100, label: '100 Solves' },
      { name: 'Diamond', target: 250, label: '250 Solves' },
      { name: 'Ruby', target: 500, label: '500 Solves' }
    ]
  },
  {
    group: 'flawless-execution',
    title: 'Flawless Execution',
    category: 'Consistency',
    description: 'Land consecutive runs with zero penalties (No +2 or DNF).',
    icon: 'Star',
    tiers: [
      { name: 'Bronze', target: 5, label: '5 Clean Solves' },
      { name: 'Silver', target: 10, label: '10 Clean Solves' },
      { name: 'Gold', target: 25, label: '25 Clean Solves' },
      { name: 'Emerald', target: 50, label: '50 Clean Solves' },
      { name: 'Diamond', target: 100, label: '100 Clean Solves' },
      { name: 'Ruby', target: 200, label: '200 Clean Solves' }
    ]
  },
  {
    group: 'visionary-scanner',
    title: 'Visionary Scanner',
    category: 'Telemetry',
    description: 'Use the camera AI to scan physical cube states into the app.',
    icon: 'Award',
    tiers: [
      { name: 'Bronze', target: 1, label: '1 Scan' },
      { name: 'Silver', target: 5, label: '5 Scans' },
      { name: 'Gold', target: 10, label: '10 Scans' },
      { name: 'Emerald', target: 25, label: '25 Scans' },
      { name: 'Diamond', target: 50, label: '50 Scans' },
      { name: 'Ruby', target: 100, label: '100 Scans' }
    ]
  },
  {
    group: 'gladiator-arena',
    title: 'Gladiator Arena',
    category: 'Multiplayer',
    description: 'Accumulate live matchmaking arena wins against other users.',
    icon: 'Medal',
    tiers: [
      { name: 'Bronze', target: 5, label: '5 Wins' },
      { name: 'Silver', target: 15, label: '15 Wins' },
      { name: 'Gold', target: 30, label: '30 Wins' },
      { name: 'Emerald', target: 50, label: '50 Wins' },
      { name: 'Diamond', target: 100, label: '100 Wins' },
      { name: 'Ruby', target: 250, label: '250 Wins' }
    ]
  }
];

// FLATTENED LIST FOR ROUTE MAPPINGS
const ALL_BADGES = [];
BADGE_GROUPS.forEach(g => {
  g.tiers.forEach(tier => {
    ALL_BADGES.push({
      id: `${g.group}-${tier.name.toLowerCase()}`,
      title: `${g.title} (${tier.name})`,
      description: `${g.description} Requires: ${tier.label || (tier.target + ' Solves')}.`,
      icon: g.icon,
      category: g.category,
      group: g.group,
      tier: tier.name,
      target: tier.target
    });
  });
});

// @desc    Get all user achievements (locked & unlocked status)
// @route   GET /api/achievements
// @access  Private
exports.getAchievements = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const unlocked = await Achievement.find({ user: userId });
    const unlockedIds = new Set(unlocked.flatMap(a => [a.badgeId, a.achievementId].filter(Boolean)));

    // Calculate metrics strictly from non-flagged and non-manual solves
    const solves = await SolveHistory.find({
      user: userId,
      isDeleted: false,
      verificationStatus: { $ne: 'flagged' },
      isManual: { $ne: true }
    }).sort({ date: 1 });
    const totalSolves = solves.length;
    
    const validSolvesForAvg = solves.filter(s => s.penalty !== 'DNF');
    let rollingAvg = 0;
    if (validSolvesForAvg.length > 0) {
      const recentSolves = validSolvesForAvg.slice(-20);
      const sum = recentSolves.reduce((acc, s) => acc + s.timeMs + (s.penalty === '+2' ? 2000 : 0), 0);
      rollingAvg = sum / recentSolves.length;
    }

    const validSolves = solves.filter(s =>
      s.penalty !== 'DNF' && !(rollingAvg > 0 && s.timeMs < 0.50 * rollingAvg)
    );
    const validTimes = validSolves.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
    
    // 1. Best Single Solve
    const bestTimeMs = validTimes.length > 0 ? Math.min(...validTimes) : null;
    const bestTimeSec = bestTimeMs ? parseFloat((bestTimeMs / 1000).toFixed(3)) : null;

    // 2. Best TPS
    const bestTps = bestTimeMs ? parseFloat((50 / (bestTimeMs / 1000)).toFixed(2)) : 0;

    // 3. Max session solves
    const sessionCounts = await SolveHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false, verificationStatus: { $ne: 'flagged' }, isManual: { $ne: true } } },
      { $group: { _id: "$sessionId", count: { $sum: 1 } } }
    ]);
    const maxSessionSolves = sessionCounts.length > 0 ? Math.max(...sessionCounts.map(s => s.count)) : 0;

    // 4. Max clean streak
    let maxCleanStreak = 0;
    let currentCleanStreak = 0;
    for (const solve of solves) {
      if (solve.penalty === 'None') {
        currentCleanStreak++;
        if (currentCleanStreak > maxCleanStreak) {
          maxCleanStreak = currentCleanStreak;
        }
      } else {
        currentCleanStreak = 0;
      }
    }

    // 5. Streak calculation (from history)
    let currentStreak = 0;
    const uniqueDays = new Set(solves.map(s => new Date(s.date).toDateString()));
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

    // 6. Scans count
    const totalScans = await CubeScan.countDocuments({ user: userId });

    // 7. Arena wins
    const totalWins = user.multiplayerWins || 0;

    const achievementsList = ALL_BADGES.map(badge => {
      let userValue = 0;

      switch (badge.group) {
        case 'solves-marathon':
          userValue = totalSolves;
          break;
        case 'speed-frontier':
          userValue = bestTimeSec ? bestTimeSec : 0;
          break;
        case 'consistency-grind':
          userValue = currentStreak;
          break;
        case 'fingertrick-maestro':
          userValue = bestTps;
          break;
        case 'session-marathoner':
          userValue = maxSessionSolves;
          break;
        case 'flawless-execution':
          userValue = maxCleanStreak;
          break;
        case 'visionary-scanner':
          userValue = totalScans;
          break;
        case 'gladiator-arena':
          userValue = totalWins;
          break;
      }

      // Auto-award: check if user qualifies but hasn't been awarded yet
      let qualifies = false;
      switch (badge.group) {
        case 'solves-marathon':
          qualifies = totalSolves >= badge.target;
          break;
        case 'speed-frontier':
          qualifies = bestTimeSec !== null && bestTimeSec <= badge.target;
          break;
        case 'consistency-grind':
          qualifies = currentStreak >= badge.target;
          break;
        case 'fingertrick-maestro':
          qualifies = bestTps >= badge.target;
          break;
        case 'session-marathoner':
          qualifies = maxSessionSolves >= badge.target;
          break;
        case 'flawless-execution':
          qualifies = maxCleanStreak >= badge.target;
          break;
        case 'visionary-scanner':
          qualifies = totalScans >= badge.target;
          break;
        case 'gladiator-arena':
          qualifies = totalWins >= badge.target;
          break;
      }

      if (qualifies && !unlockedIds.has(badge.id)) {
        // Award on-the-fly
        Achievement.create({
          user: userId,
          badgeId: badge.id,
          achievementId: badge.id,
          title: badge.title,
          category: badge.category || 'General',
          progress: badge.target || 1,
          unlockedAt: new Date()
        }).catch(err => {
          console.error('Failed to auto-create achievement document:', err.message);
        });
        unlockedIds.add(badge.id);
      }

      const isUnlocked = unlockedIds.has(badge.id);

      // Calculate progress value relative to target
      let progress = 0;
      const progressTarget = badge.target;

      if (badge.group === 'speed-frontier') {
        if (isUnlocked) {
          progress = progressTarget;
        } else if (userValue > 0) {
          progress = parseFloat(((progressTarget / userValue) * progressTarget).toFixed(2));
        } else {
          progress = 0;
        }
      } else {
        progress = Math.min(userValue, progressTarget);
      }

      const unlockedRecord = unlocked.find(a => a.badgeId === badge.id || a.achievementId === badge.id);

      return {
        id: badge.id,
        title: badge.title,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        isUnlocked,
        unlockedAt: unlockedRecord ? unlockedRecord.unlockedAt : null,
        progress,
        progressTarget
      };
    });

    res.status(200).json({ success: true, data: achievementsList });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// HELPER FOR REAL-TIME ACHIEVEMENT TRIGGERS
exports.evaluateAchievements = async (userId, solve = null) => {
  try {
    const user = await User.findById(userId);
    if (!user) return { newUnlocks: [], newNotifications: [] };

    // Query non-flagged, non-manual solves for rolling average & stats evaluation
    const solves = await SolveHistory.find({
      user: userId,
      isDeleted: false,
      verificationStatus: { $ne: 'flagged' },
      isManual: { $ne: true }
    }).sort({ date: 1 });

    const nonCheatSolves = solves.filter(s => s.penalty !== 'DNF');

    let rollingAvg = 0;
    if (nonCheatSolves.length > 0) {
      const previousSolves = solve
        ? nonCheatSolves.filter(s => s._id.toString() !== solve._id.toString())
        : nonCheatSolves;
      const recentSolves = (previousSolves.length > 0 ? previousSolves : nonCheatSolves).slice(-20);
      const sum = recentSolves.reduce((acc, s) => acc + s.timeMs + (s.penalty === '+2' ? 2000 : 0), 0);
      rollingAvg = sum / recentSolves.length;
    }

    // Strict Anti-Cheat Gate: completely return early if solve is flagged, manual, or anomalous
    if (solve) {
      const isFlagged = solve.verificationStatus === 'flagged';
      const isManual = solve.isManual === true;
      const isSuspicious = rollingAvg > 0 && solve.timeMs < 0.50 * rollingAvg;

      if (isFlagged || isManual || isSuspicious) {
        return { newUnlocks: [], newNotifications: [] };
      }
    }

    const unlocked = await Achievement.find({ user: userId });
    const unlockedIds = new Set(unlocked.flatMap(a => [a.badgeId, a.achievementId].filter(Boolean)));
    const newUnlocks = [];

    const checkAndAward = async (badgeId, title) => {
      if (!unlockedIds.has(badgeId)) {
        const badge = ALL_BADGES.find(b => b.id === badgeId);
        try {
          await Achievement.create({
            user: userId,
            badgeId: badgeId,
            achievementId: badgeId,
            title: title,
            category: badge ? badge.category : 'General',
            progress: badge ? badge.target : 1,
            unlockedAt: new Date()
          });
          unlockedIds.add(badgeId);
          const trackName = badge ? badge.title.split(' (')[0] : title;
          newUnlocks.push({
            id: badgeId,
            title: badge ? badge.title : title,
            tier: badge ? badge.tier : '',
            trackName
          });
        } catch (aErr) {
          console.error('Failed to create achievement document:', aErr.message);
        }
      }
    };

    const totalSolves = solves.length;

    const validSpeedSolves = nonCheatSolves.filter(s =>
      !(rollingAvg > 0 && s.timeMs < 0.50 * rollingAvg)
    );

    const validTimes = validSpeedSolves.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
    
    const bestTimeMs = validTimes.length > 0 ? Math.min(...validTimes) : null;
    const bestTimeSec = bestTimeMs ? parseFloat((bestTimeMs / 1000).toFixed(3)) : null;
    const bestTps = bestTimeMs ? parseFloat((50 / (bestTimeMs / 1000)).toFixed(2)) : 0;

    const sessionCounts = await SolveHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false, verificationStatus: { $ne: 'flagged' }, isManual: { $ne: true } } },
      { $group: { _id: "$sessionId", count: { $sum: 1 } } }
    ]);
    const maxSessionSolves = sessionCounts.length > 0 ? Math.max(...sessionCounts.map(s => s.count)) : 0;

    let maxCleanStreak = 0;
    let currentCleanStreak = 0;
    for (const solveItem of solves) {
      if (solveItem.penalty === 'None') {
        currentCleanStreak++;
        if (currentCleanStreak > maxCleanStreak) {
          maxCleanStreak = currentCleanStreak;
        }
      } else {
        currentCleanStreak = 0;
      }
    }

    let currentStreak = 0;
    const uniqueDays = new Set(solves.map(s => new Date(s.date).toDateString()));
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

    const totalScans = await CubeScan.countDocuments({ user: userId });
    const totalWins = user.multiplayerWins || 0;

    // Check all badges
    for (const badge of ALL_BADGES) {
      let qualifies = false;
      
      switch (badge.group) {
        case 'solves-marathon':
          qualifies = totalSolves >= badge.target;
          break;
        case 'speed-frontier':
          qualifies = bestTimeSec !== null && bestTimeSec <= badge.target;
          break;
        case 'consistency-grind':
          qualifies = currentStreak >= badge.target;
          break;
        case 'fingertrick-maestro':
          qualifies = bestTps >= badge.target;
          break;
        case 'session-marathoner':
          qualifies = maxSessionSolves >= badge.target;
          break;
        case 'flawless-execution':
          qualifies = maxCleanStreak >= badge.target;
          break;
        case 'visionary-scanner':
          qualifies = totalScans >= badge.target;
          break;
        case 'gladiator-arena':
          qualifies = totalWins >= badge.target;
          break;
      }

      if (qualifies) {
        await checkAndAward(badge.id, badge.title);
      }
    }

    // Filter unlockedTiers so that if a user hits multiple tiers in the same track during one solve, keep ONLY the highest tier
    const TIER_RANK = { 'Bronze': 1, 'Silver': 2, 'Gold': 3, 'Emerald': 4, 'Diamond': 5, 'Ruby': 6 };
    const unlockedTiersMap = new Map();
    for (const item of newUnlocks) {
      const existing = unlockedTiersMap.get(item.trackName);
      if (!existing) {
        unlockedTiersMap.set(item.trackName, item);
      } else {
        const existingRank = TIER_RANK[existing.tier] || 0;
        const currentRank = TIER_RANK[item.tier] || 0;
        if (currentRank > existingRank) {
          unlockedTiersMap.set(item.trackName, item);
        }
      }
    }
    const unlockedTiers = Array.from(unlockedTiersMap.values());

    const createdNotifications = [];
    if (unlockedTiers.length === 1) {
      const { createNotification } = require('./notificationController');
      const item = unlockedTiers[0];
      const notifDoc = await createNotification({
        recipient: userId,
        user: userId,
        type: 'achievement',
        title: 'TROPHY UNLOCKED!',
        content: `You reached ${item.tier} in ${item.trackName}!`,
        unread: true,
        solve: solve ? solve._id : null,
        solveId: solve ? solve._id : null,
        createdAt: new Date()
      });
      if (notifDoc) {
        createdNotifications.push(notifDoc);
      }
    } else if (unlockedTiers.length > 1) {
      const { createNotification } = require('./notificationController');
      const trackSummary = unlockedTiers.map(t => `${t.trackName} (${t.tier})`).join(', ');
      const notifDoc = await createNotification({
        recipient: userId,
        user: userId,
        type: 'achievement',
        title: `${unlockedTiers.length} TROPHIES UNLOCKED!`,
        content: `New tiers reached: ${trackSummary}.`,
        unread: true,
        solve: solve ? solve._id : null,
        solveId: solve ? solve._id : null,
        createdAt: new Date()
      });
      if (notifDoc) {
        createdNotifications.push(notifDoc);
      }
    }

    return { newUnlocks, newNotifications: createdNotifications };
  } catch (error) {
    console.error('Error evaluating achievements:', error);
    return { newUnlocks: [], newNotifications: [] };
  }
};

// HELPER FOR RECALCULATING & REVERTING ACHIEVEMENTS ON SOLVE DELETION
exports.recalculateUserAchievements = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const solves = await SolveHistory.find({
      user: userId,
      isDeleted: false,
      verificationStatus: { $ne: 'flagged' },
      isManual: { $ne: true }
    }).sort({ date: 1 });

    const totalSolves = solves.length;
    const nonCheatSolves = solves.filter(s => s.penalty !== 'DNF');

    let rollingAvg = 0;
    if (nonCheatSolves.length > 0) {
      const recentSolves = nonCheatSolves.slice(-20);
      const sum = recentSolves.reduce((acc, s) => acc + s.timeMs + (s.penalty === '+2' ? 2000 : 0), 0);
      rollingAvg = sum / recentSolves.length;
    }

    const validSpeedSolves = nonCheatSolves.filter(s =>
      !(rollingAvg > 0 && s.timeMs < 0.50 * rollingAvg)
    );

    const validTimes = validSpeedSolves.map(s => s.timeMs + (s.penalty === '+2' ? 2000 : 0));
    const bestTimeMs = validTimes.length > 0 ? Math.min(...validTimes) : null;
    const bestTimeSec = bestTimeMs ? parseFloat((bestTimeMs / 1000).toFixed(3)) : null;
    const bestTps = bestTimeMs ? parseFloat((50 / (bestTimeMs / 1000)).toFixed(2)) : 0;

    const sessionCounts = await SolveHistory.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId), isDeleted: false, verificationStatus: { $ne: 'flagged' }, isManual: { $ne: true } } },
      { $group: { _id: "$sessionId", count: { $sum: 1 } } }
    ]);
    const maxSessionSolves = sessionCounts.length > 0 ? Math.max(...sessionCounts.map(s => s.count)) : 0;

    let maxCleanStreak = 0;
    let currentCleanStreak = 0;
    for (const solveItem of solves) {
      if (solveItem.penalty === 'None') {
        currentCleanStreak++;
        if (currentCleanStreak > maxCleanStreak) {
          maxCleanStreak = currentCleanStreak;
        }
      } else {
        currentCleanStreak = 0;
      }
    }

    let currentStreak = 0;
    const uniqueDays = new Set(solves.map(s => new Date(s.date).toDateString()));
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

    const totalScans = await CubeScan.countDocuments({ user: userId });
    const totalWins = user.multiplayerWins || 0;

    // Evaluate all badges against current valid solves
    // For any achievement in DB that no longer meets its target threshold, purge it from DB
    const existingAchievements = await Achievement.find({ user: userId });
    for (const ach of existingAchievements) {
      const bId = ach.badgeId || ach.achievementId;
      const badge = ALL_BADGES.find(b => b.id === bId);
      if (!badge) continue;

      let qualifies = false;
      switch (badge.group) {
        case 'solves-marathon': qualifies = totalSolves >= badge.target; break;
        case 'speed-frontier': qualifies = bestTimeSec !== null && bestTimeSec <= badge.target; break;
        case 'consistency-grind': qualifies = currentStreak >= badge.target; break;
        case 'fingertrick-maestro': qualifies = bestTps >= badge.target; break;
        case 'session-marathoner': qualifies = maxSessionSolves >= badge.target; break;
        case 'flawless-execution': qualifies = maxCleanStreak >= badge.target; break;
        case 'visionary-scanner': qualifies = totalScans >= badge.target; break;
        case 'gladiator-arena': qualifies = totalWins >= badge.target; break;
      }

      if (!qualifies) {
        await Achievement.deleteMany({
          user: userId,
          $or: [{ badgeId: badge.id }, { achievementId: badge.id }]
        });
      }
    }
  } catch (err) {
    console.error('Error recalculating achievements on solve deletion:', err);
  }
};