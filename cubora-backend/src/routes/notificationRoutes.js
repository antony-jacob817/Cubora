const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markRead, 
  markAllRead 
} = require('../controllers/notificationController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getNotifications)
  .put(markAllRead);

router.route('/:id')
  .put(markRead);

module.exports = router;
