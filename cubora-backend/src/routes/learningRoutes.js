const express = require('express');
const router = express.Router();
const {
  getLearningProgress,
  completeLesson,
  masterAlgorithm,
  updateCurrentPath
} = require('../controllers/learningController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/progress', getLearningProgress);
router.post('/complete-lesson', completeLesson);
router.post('/master-algorithm', masterAlgorithm);
router.post('/path', updateCurrentPath);

module.exports = router;
