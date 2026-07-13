const express = require('express');
const { signup, login, getMe, updateAvatar, updateName, deleteAccount, changePassword, updateProfile, updateMultiplayerResult } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
// Protected routes
router.get('/me', protect, getMe);
router.put('/avatar', protect, updateAvatar);
router.put('/name', protect, updateName);
router.put('/profile', protect, updateProfile);
router.post('/multiplayer-result', protect, updateMultiplayerResult);
router.put('/change-password', protect, changePassword);
router.delete('/delete', protect, deleteAccount);

module.exports = router;