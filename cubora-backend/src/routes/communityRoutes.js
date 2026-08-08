const express = require('express');
const router = express.Router();
const { 
  getPosts, 
  createPost, 
  editPost,
  deletePost,
  toggleLike,
  getPostLikers,
  getComments,
  createComment,
  editComment,
  deleteComment,
  toggleCommentLike,
  searchUsers,
  getPBsLeaderboard,
  getActiveChallenge
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

// All community routes require authentication
router.use(protect);

router.route('/challenge/active')
  .get(getActiveChallenge);

router.route('/leaderboard/pbs')
  .get(getPBsLeaderboard);

router.route('/users/search')
  .get(searchUsers);

router.route('/')
  .get(getPosts)
  .post(createPost);

router.route('/:id')
  .put(editPost)
  .delete(deletePost);

router.route('/:id/like')
  .put(toggleLike);

router.route('/:postId/likers')
  .get(getPostLikers);

// Comment routes
router.route('/:postId/comments')
  .get(getComments)
  .post(createComment);

router.route('/comments/:id')
  .put(editComment)
  .delete(deleteComment);

router.route('/comments/:id/like')
  .put(toggleCommentLike);

module.exports = router;
