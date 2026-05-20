const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const solverRoutes = require('./routes/solverRoutes');

const app = express();

// Initialize Database Connection
connectDB();

app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/solver', solverRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Cubora Backend running on port ${PORT}`);
});