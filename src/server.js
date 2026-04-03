const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import database configuration
const { testConnection, initializeDatabase } = require('./config/database');

// Initialize database
initializeDatabase();

// Import routes with error handling
let authRoutes, membersRoutes, paymentsRoutes, attendanceRoutes, announcementsRoutes;

try {
  authRoutes = require('./routes/auth');
  console.log('✅ Auth routes loaded');
} catch (error) {
  console.error('❌ Failed to load auth routes:', error.message);
}

try {
  membersRoutes = require('./routes/members');
  console.log('✅ Members routes loaded');
} catch (error) {
  console.error('❌ Failed to load members routes:', error.message);
}

try {
  paymentsRoutes = require('./routes/payments');
  console.log('✅ Payments routes loaded');
} catch (error) {
  console.error('❌ Failed to load payments routes:', error.message);
}

try {
  attendanceRoutes = require('./routes/attendance');
  console.log('✅ Attendance routes loaded');
} catch (error) {
  console.error('❌ Failed to load attendance routes:', error.message);
}

try {
  announcementsRoutes = require('./routes/announcements');
  console.log('✅ Announcements routes loaded');
} catch (error) {
  console.error('❌ Failed to load announcements routes:', error.message);
}

// Use routes
if (authRoutes) app.use('/api/auth', authRoutes);
if (membersRoutes) app.use('/api/members', membersRoutes);
if (paymentsRoutes) app.use('/api/payments', paymentsRoutes);
if (attendanceRoutes) app.use('/api/attendance', attendanceRoutes);
if (announcementsRoutes) app.use('/api/announcements', announcementsRoutes);

// Add test routes
try {
  const testRoutes = require('./routes/test');
  app.use('/api/test', testRoutes);
  console.log('✅ Test routes loaded');
} catch (error) {
  console.error('❌ Failed to load test routes:', error.message);
}

// Simple test endpoint (no auth required)
app.get('/api/test', (req, res) => {
  res.json({
    message: 'Test endpoint working',
    environment: process.env.NODE_ENV,
    database: process.env.TIDB_DATABASE || 'Not configured',
    host: process.env.TIDB_HOST || 'Not configured',
    user: process.env.TIDB_USER || 'Not configured',
    jwt_secret: process.env.JWT_SECRET ? 'Configured' : 'Not configured',
    timestamp: new Date().toISOString()
  });
});

// API routes listing
app.get('/api', (req, res) => {
  res.json({
    message: 'Sport Gym Management API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      members: '/api/members', 
      payments: '/api/payments',
      attendance: '/api/attendance',
      announcements: '/api/announcements',
      health: '/api/health'
    },
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
