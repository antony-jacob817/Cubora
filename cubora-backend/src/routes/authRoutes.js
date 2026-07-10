const express = require('express');
const { signup, login, getMe, updateAvatar, updateName, updatePassword, deleteAccount } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
// Protected routes
router.get('/me', protect, getMe);
router.put('/avatar', protect, updateAvatar);
router.put('/name', protect, updateName);
router.put('/password', protect, updatePassword);
router.delete('/delete', protect, deleteAccount);

module.exports = router;