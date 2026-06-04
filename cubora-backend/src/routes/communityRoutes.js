const express = require('express');
const router = express.Router();
const { getPosts, createPost, toggleLike } = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

// All community routes require authentication
router.use(protect);

router.route('/')
  .get(getPosts)
  .post(createPost);

router.route('/:id/like')
  .put(toggleLike);

module.exports = router;
