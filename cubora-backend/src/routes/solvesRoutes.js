const express = require('express');
const router = express.Router();
// Added updateSolve to the import list here
const { saveSolve, getSolves, deleteSolve, getSolveStats, updateSolve } = require('../controllers/solvesController');
const { protect } = require('../middleware/auth');

// Protected solves routes
router.use(protect);

router.route('/')
  .post(saveSolve)
  .get(getSolves);

router.get('/stats', getSolveStats);

router.route('/:id')
  .delete(deleteSolve)
  .put(updateSolve);



module.exports = router;