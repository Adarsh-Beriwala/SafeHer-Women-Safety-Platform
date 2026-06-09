const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SafeHer Backend API',
    timestamp: new Date().toISOString(),
  });
});

// Volunteer routes (will be expanded in Day 3)
app.get('/api/volunteers/nearby', (req, res) => {
  res.json({ message: 'Volunteer routes coming in Day 3', volunteers: [] });
});

// Safety routes (will be expanded in Day 4)
app.get('/api/safety', (req, res) => {
  res.json({ message: 'Safety score routes coming in Day 4' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ SafeHer Backend running on http://localhost:${PORT}`);
});
