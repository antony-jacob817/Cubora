const express = require('express');
const router = express.Router();
const SolverEngine = require('../services/solverEngine');
const CubeScan = require('../models/CubeScan');
const { protect } = require('../middleware/auth');

// @desc    Process a verified cube state matrix, solve, and save to history
// @route   POST /api/solver/solve
// @access  Private
router.post('/solve', protect, async (req, res) => {
  const { cubeState, detectedColors, method, scanId } = req.body;

  if (!cubeState) {
    return res.status(400).json({ success: false, error: 'Missing cube state parameter configuration block.' });
  }

  const startCalc = Date.now();
  const solutionResult = SolverEngine.generateSolution(cubeState, method);
  const calcTime = Date.now() - startCalc;

  if (!solutionResult.success) {
    return res.status(422).json(solutionResult); 
  }

  // Save the successful solve directly to the database
  try {
    const solveSteps = solutionResult.steps 
      ? solutionResult.steps.flatMap(s => s.moves.split(' ')).filter(Boolean) 
      : [];

    let returnedScanId = scanId;
    if (scanId) {
      await CubeScan.findOneAndUpdate(
        { _id: scanId, user: req.user.id },
        {
          cubeState,
          detectedColors: detectedColors || cubeState,
          solveSteps,
          solveTimeMs: calcTime
        }
      );
    } else {
      const newScan = await CubeScan.create({
        user: req.user.id,
        cubeState,
        detectedColors: detectedColors || cubeState,
        solveSteps,
        solveTimeMs: calcTime
      });
      returnedScanId = newScan._id;
    }
    
    res.status(200).json({ ...solutionResult, scanId: returnedScanId });
  } catch (err) {
    console.error('Failed to save cube scan history to MongoDB:', err);
    // Proceed to return solution even if telemetry fails
    res.status(200).json(solutionResult);
  }
});

// @desc    Get all user scan histories
// @route   GET /api/solver/history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const scans = await CubeScan.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: scans.length, data: scans });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Delete a specific scan history
// @route   DELETE /api/solver/history/:id
// @access  Private
router.delete('/history/:id', protect, async (req, res) => {
  try {
    const scan = await CubeScan.findOne({ _id: req.params.id, user: req.user.id });

    if (!scan) {
      return res.status(404).json({ success: false, error: 'Scan record not found' });
    }

    await scan.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;