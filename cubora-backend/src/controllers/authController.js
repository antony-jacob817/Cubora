const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to generate JWT
const generateToken = (id) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || process.env.JWT_ACCESS_TOKEN_EXPIRES || '7d';
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: typeof expiresIn === 'number' || !isNaN(Number(expiresIn)) ? Number(expiresIn) : expiresIn,
  });
};

// @desc    Register a user
// @route   POST /api/auth/signup
// @access  Public
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user
    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password inputs
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user (must explicitly select password since we set select: false in the model)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      token: generateToken(user._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private (Protected Route)
exports.getMe = async (req, res) => {
  try {
    // req.user is set in the 'protect' middleware
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user avatar
// @route   PUT /api/auth/avatar
// @access  Private (Protected Route)
exports.updateAvatar = async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar) {
      return res.status(400).json({ success: false, error: 'Please provide an avatar value' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    user.avatar = avatar;
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user display name (once every 24 hours restriction)
// @route   PUT /api/auth/name
// @access  Private (Protected Route)
exports.updateName = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ success: false, error: 'Please provide a valid display name' });
    }

    const trimmedName = name.trim();
    if (trimmedName.length > 50) {
      return res.status(400).json({ success: false, error: 'Display name cannot exceed 50 characters' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Strict 24 hours calculation threshold block
    const limitDurationMs = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    if (user.name_updated_at) {
      const timeSinceLastUpdate = Date.now() - user.name_updated_at.getTime();
      if (timeSinceLastUpdate < limitDurationMs) {
        const nextAllowedChange = new Date(user.name_updated_at.getTime() + limitDurationMs);
        const remainingMs = nextAllowedChange - Date.now();
        
        const remainingHours = Math.floor(remainingMs / (60 * 60 * 1000));
        const remainingMinutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
        
        const hourStr = remainingHours > 0 ? `${remainingHours} hour${remainingHours > 1 ? 's' : ''}` : '';
        const minStr = remainingMinutes > 0 ? `${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}` : '';
        const waitStr = [hourStr, minStr].filter(Boolean).join(' and ');

        return res.status(400).json({ 
          success: false, 
          error: `You can only change your display name once every 24 hours. Please wait ${waitStr || 'a moment'}.` 
        });
      }
    }

    user.name = trimmedName;
    user.name_updated_at = Date.now();
    await user.save();

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Delete user account and all associated data
// @route   DELETE /api/auth/delete
// @access  Private (Protected Route)
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    // Delete user settings
    const UserSettings = require('../models/UserSettings');
    await UserSettings.findOneAndDelete({ user: userId });

    // Delete solve history
    const SolveHistory = require('../models/SolveHistory');
    await SolveHistory.deleteMany({ user: userId });

    // Delete community posts
    const CommunityPost = require('../models/CommunityPost');
    await CommunityPost.deleteMany({ user: userId });

    // Delete scans
    const CubeScan = require('../models/CubeScan');
    await CubeScan.deleteMany({ user: userId });

    // Delete learning progress
    const LearningProgress = require('../models/LearningProgress');
    await LearningProgress.deleteMany({ user: userId });

    // Delete achievements
    const Achievement = require('../models/Achievement');
    await Achievement.deleteMany({ user: userId });

    // Delete user
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, message: 'Account and all associated records deleted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Change user password
// @route   PUT /api/auth/change-password
// @access  Private (Protected Route)
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, error: 'Please provide old and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Incorrect old password' });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
