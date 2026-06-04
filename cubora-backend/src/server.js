const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const solverRoutes = require('./routes/solverRoutes');
const solvesRoutes = require('./routes/solvesRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const achievementsRoutes = require('./routes/achievementsRoutes');
const communityRoutes = require('./routes/communityRoutes');

const app = express();

// Initialize Database Connection
connectDB();

app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/solver', solverRoutes);
app.use('/api/solves', solvesRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/community', communityRoutes);

// Global Error Handler Middleware to sanitize all runtime failures
app.use((err, req, res, next) => {
  console.error('SERVER_ERROR_CAUGHT:', err);
  res.status(err.status || 500).json({ 
    success: false, 
    error: err.message || 'An internal server error occurred' 
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Cubora Backend running on port ${PORT}`);
});