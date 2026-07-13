const User = require('../models/User');
const { evaluateAchievements } = require('./achievementsController');
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

// @desc    Update user profile (display name, username, about, avatar)
// @route   PUT /api/auth/profile
// @access  Private (Protected Route)
exports.updateProfile = async (req, res) => {
  try {
    const { name, username, about, avatar } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // 1. Update display name (maximum 2 changes within a 14-day period)
    if (name && name.trim() !== '') {
      const trimmedName = name.trim();
      if (trimmedName.length > 50) {
        return res.status(400).json({ success: false, error: 'Display name cannot exceed 50 characters' });
      }
      
      if (trimmedName !== user.name) {
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const nameChangesInPeriod = (user.name_update_history || []).filter(date => date >= fourteenDaysAgo);
        
        if (nameChangesInPeriod.length >= 2) {
          const oldestChange = nameChangesInPeriod.sort((a, b) => a - b)[0];
          const nextAllowed = new Date(oldestChange.getTime() + 14 * 24 * 60 * 60 * 1000);
          const remainingMs = nextAllowed - Date.now();
          const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
          const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          const minutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
          
          let waitStr = '';
          if (days > 0) waitStr += `${days} day${days > 1 ? 's' : ''}`;
          if (hours > 0) waitStr += `${waitStr ? ', ' : ''}${hours} hour${hours > 1 ? 's' : ''}`;
          if (minutes > 0) waitStr += `${waitStr ? ' and ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
          
          return res.status(400).json({ 
            success: false, 
            error: `You can only change your display name twice within a 14-day period. Please wait ${waitStr || 'a moment'}.` 
          });
        }
        
        user.name = trimmedName;
        user.name_update_history.push(new Date());
        user.name_updated_at = Date.now();
      }
    }

    // 2. Update username (must be unique, maximum 2 changes within a 14-day period)
    if (username && username.trim() !== '') {
      const trimmedUsername = username.trim().toLowerCase();
      
      if (trimmedUsername !== user.username) {
        const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
        const usernameChangesInPeriod = (user.username_update_history || []).filter(date => date >= fourteenDaysAgo);
        
        if (usernameChangesInPeriod.length >= 2) {
          const oldestChange = usernameChangesInPeriod.sort((a, b) => a - b)[0];
          const nextAllowed = new Date(oldestChange.getTime() + 14 * 24 * 60 * 60 * 1000);
          const remainingMs = nextAllowed - Date.now();
          const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
          const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
          const minutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
          
          let waitStr = '';
          if (days > 0) waitStr += `${days} day${days > 1 ? 's' : ''}`;
          if (hours > 0) waitStr += `${waitStr ? ', ' : ''}${hours} hour${hours > 1 ? 's' : ''}`;
          if (minutes > 0) waitStr += `${waitStr ? ' and ' : ''}${minutes} minute${minutes > 1 ? 's' : ''}`;
          
          return res.status(400).json({ 
            success: false, 
            error: `You can only change your username twice within a 14-day period. Please wait ${waitStr || 'a moment'}.` 
          });
        }
        
        // Check if username is already taken by another user
        const existingUser = await User.findOne({ username: trimmedUsername, _id: { $ne: req.user.id } });
        if (existingUser) {
          return res.status(400).json({ success: false, error: 'Username is already taken' });
        }
        
        user.username = trimmedUsername;
        user.username_update_history.push(new Date());
      }
    }

    // 3. Update about field
    if (about !== undefined) {
      const trimmedAbout = about.trim();
      if (trimmedAbout.length > 30) {
        return res.status(400).json({ success: false, error: 'About bio cannot exceed 30 characters' });
      }
      user.about = trimmedAbout || 'Speedcuber';
    }

    // 4. Update avatar
    if (avatar !== undefined) {
      user.avatar = avatar;
    }

    await user.save();
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update multiplayer arena stats (wins and ELO rating)
// @route   POST /api/auth/multiplayer-result
// @access  Private
exports.updateMultiplayerResult = async (req, res) => {
  try {
    const { won, elo } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (won === true) {
      user.multiplayerWins = (user.multiplayerWins || 0) + 1;
    }
    
    if (elo !== undefined && typeof elo === 'number') {
      user.elo = elo;
    }

    await user.save();

    // Check if user unlocks Gladiator Arena achievements!
    const newUnlocks = await evaluateAchievements(req.user.id);

    res.status(200).json({
      success: true,
      data: {
        elo: user.elo,
        multiplayerWins: user.multiplayerWins
      },
      newUnlocks
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
