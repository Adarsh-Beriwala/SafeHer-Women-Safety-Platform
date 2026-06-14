const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Initialize Firebase Admin (must be before routes)
const { admin } = require('./config/firebase');

// Import routes
const sosRoutes = require('./routes/sos');
const volunteerRoutes = require('./routes/volunteers');
const evidenceRoutes = require('./routes/evidence');
const userRoutes = require('./routes/users');

// Import middleware
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// ============ MIDDLEWARE ============
app.use(cors({
  origin: true, // Allow any origin to fix local network errors
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ============ PUBLIC ROUTES ============

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SafeHer Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// SOS trigger (public — no auth required so it works fast in emergencies)
app.use('/api/sos', sosRoutes);

// ============ PROTECTED ROUTES ============
// These require Firebase auth token

app.use('/api/volunteers', volunteerRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/users', authMiddleware, userRoutes);

// ============ ERROR HANDLING ============

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ============ START SERVER ============
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   🛡️  SafeHer Backend API           ║
  ║   Running on port ${PORT}              ║
  ║   http://localhost:${PORT}             ║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;
// API Server configuration complete
