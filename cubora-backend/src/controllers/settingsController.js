const UserSettings = require('../models/UserSettings');

// @desc    Get user dashboard and timer settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await UserSettings.findOne({ user: req.user.id });

    if (!settings) {
      // Create defaults if not exists
      settings = await UserSettings.create({
        user: req.user.id,
        preferredMethod: 'CFOP',
        theme: 'dark',
        timerInspection: true,
        smartCubeConnected: false,
        accent: 'graphite'
      });
    }

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res) => {
  try {
    const { preferredMethod, theme, timerInspection, smartCubeConnected, accent } = req.body;

    let settings = await UserSettings.findOne({ user: req.user.id });

    if (!settings) {
      settings = new UserSettings({ user: req.user.id });
    }

    if (preferredMethod !== undefined) settings.preferredMethod = preferredMethod;
    if (theme !== undefined) settings.theme = theme;
    if (timerInspection !== undefined) settings.timerInspection = timerInspection;
    if (smartCubeConnected !== undefined) settings.smartCubeConnected = smartCubeConnected;
    if (accent !== undefined) settings.accent = accent;
    settings.updatedAt = Date.now();

    await settings.save();

    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
