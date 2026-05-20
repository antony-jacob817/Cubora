const express = require('express');
const router = express.Router();
const SolverEngine = require('../services/solverEngine');
const { protect } = require('../middleware/auth');

// @desc    Process a verified cube state matrix and compile structural solving routes
// @route   POST /api/solver/solve
// @access  Private/Public (Protected via token middleware here)
router.post('/solve', protect, (req, res) => {
  const { cubeState, method } = req.body;

  if (!cubeState) {
    return res.status(400).json({ success: false, error: 'Missing cube state parameter configuration block.' });
  }

  const solutionResult = SolverEngine.generateSolution(cubeState, method);

  if (!solutionResult.success) {
    return res.status(422).json(solutionResult); // Unprocessable state mapping
  }

  res.status(200).json(solutionResult);
});

module.exports = router;