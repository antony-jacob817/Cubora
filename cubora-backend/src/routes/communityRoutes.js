const express = require('express');
const router = express.Router();
const { 
  getPosts, 
  createPost, 
  editPost,
  deletePost,
  toggleLike,
  getComments,
  createComment,
  editComment,
  deleteComment,
  toggleCommentLike,
  searchUsers
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

// All community routes require authentication
router.use(protect);

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
