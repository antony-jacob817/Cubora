const LearningProgress = require('../models/LearningProgress');

// Helper to format progress object
const formatProgressResponse = (progress) => {
  return {
    completedLessons: progress.completedLessons || [],
    masteredAlgorithms: progress.masteredAlgorithms || [],
    masteredAlgsCount: (progress.masteredAlgorithms || []).length,
    currentPath: progress.currentPath || 'beginner',
    lastActiveLesson: progress.lastActiveLesson || ''
  };
};

// @desc    Get user's learning progress
// @route   GET /api/learning/progress
// @access  Private
exports.getLearningProgress = async (req, res) => {
  try {
    let progress = await LearningProgress.findOne({ user: req.user.id });
    
    if (!progress) {
      progress = await LearningProgress.create({
        user: req.user.id,
        completedLessons: [],
        masteredAlgorithms: [],
        currentPath: 'beginner',
        lastActiveLesson: ''
      });
    }

    res.status(200).json({
      success: true,
      data: formatProgressResponse(progress)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Mark or toggle a lesson as completed / uncompleted
// @route   POST /api/learning/complete-lesson
// @access  Private
exports.completeLesson = async (req, res) => {
  try {
    const { lessonId, isCompleted, lastActiveLesson } = req.body;

    if (!lessonId || typeof lessonId !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid lessonId is required.' });
    }

    let updateQuery;
    if (isCompleted === false) {
      updateQuery = {
        $pull: { completedLessons: lessonId },
        ...(lastActiveLesson ? { $set: { lastActiveLesson } } : {})
      };
    } else {
      updateQuery = {
        $addToSet: { completedLessons: lessonId },
        $set: { lastActiveLesson: lastActiveLesson || lessonId }
      };
    }

    const progress = await LearningProgress.findOneAndUpdate(
      { user: req.user.id },
      updateQuery,
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: formatProgressResponse(progress)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Master or toggle an algorithm
// @route   POST /api/learning/master-algorithm
// @access  Private
exports.masterAlgorithm = async (req, res) => {
  try {
    const { algId, set, isMastered } = req.body;

    if (!algId || typeof algId !== 'string') {
      return res.status(400).json({ success: false, error: 'Valid algId is required.' });
    }

    const algSet = set || 'general';

    let progress = await LearningProgress.findOne({ user: req.user.id });
    if (!progress) {
      progress = new LearningProgress({ user: req.user.id });
    }

    const existingIndex = progress.masteredAlgorithms.findIndex(
      item => item.algId === algId && item.set === algSet
    );

    // If explicit isMastered = false, or if toggling off when already mastered
    if (isMastered === false || (isMastered === undefined && existingIndex > -1)) {
      if (existingIndex > -1) {
        progress.masteredAlgorithms.splice(existingIndex, 1);
      }
    } else {
      // Adding or updating algorithm as mastered
      if (existingIndex > -1) {
        progress.masteredAlgorithms[existingIndex].reviewCount = (progress.masteredAlgorithms[existingIndex].reviewCount || 1) + 1;
        progress.masteredAlgorithms[existingIndex].masteredAt = new Date();
      } else {
        progress.masteredAlgorithms.push({
          algId,
          set: algSet,
          masteredAt: new Date(),
          reviewCount: 1
        });
      }
    }

    await progress.save();

    res.status(200).json({
      success: true,
      data: formatProgressResponse(progress)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update current learning path
// @route   POST /api/learning/path
// @access  Private
exports.updateCurrentPath = async (req, res) => {
  try {
    const { currentPath } = req.body;
    const validPaths = ['beginner', 'simplified-cfop', 'cfop', 'roux', 'zz'];

    if (!currentPath || !validPaths.includes(currentPath)) {
      return res.status(400).json({ success: false, error: 'Invalid learning path.' });
    }

    const progress = await LearningProgress.findOneAndUpdate(
      { user: req.user.id },
      { $set: { currentPath } },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: formatProgressResponse(progress)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
