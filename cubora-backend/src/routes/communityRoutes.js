const express = require('express');
const router = express.Router();
const { 
  getPosts, 
  createPost, 
  updatePost, 
  deletePost, 
  toggleLike, 
  getComments, 
  createComment, 
  toggleCommentLike, 
  updateComment, 
  deleteComment 
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

// All community routes require authentication
router.use(protect);

router.route('/')
  .get(getPosts)
  .post(createPost);

router.route('/:id')
  .put(updatePost)
  .delete(deletePost);

router.route('/:id/like')
  .put(toggleLike);

router.route('/:postId/comments')
  .get(getComments)
  .post(createComment);

router.route('/comments/:id/like')
  .put(toggleCommentLike);

router.route('/comments/:id')
  .put(updateComment)
  .delete(deleteComment);

module.exports = router;
