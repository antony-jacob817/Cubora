const express = require('express');
const router = express.Router();
const { getAchievements } = require('../controllers/achievementsController');
const { protect } = require('../middleware/auth');

// Protected achievements routes
router.use(protect);

router.route('/')
  .get(getAchievements);

module.exports = router;
