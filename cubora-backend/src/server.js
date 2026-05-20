const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Initialize Database Connection
connectDB();

app.use(express.json());
app.use(cors());

// Mount Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Cubora Backend running on port ${PORT}`);
});