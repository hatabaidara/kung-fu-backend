const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Test database connection without auth
router.get('/db-test', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT 1 as test');
    res.json({
      message: 'Database connection successful',
      result: result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database test error:', error);
    res.status(500).json({ 
      error: 'Database connection failed',
      details: error.message 
    });
  }
});

// Test members table without auth
router.get('/members-simple', async (req, res) => {
  try {
    const [members] = await pool.query('SELECT COUNT(*) as count FROM members');
    res.json({
      message: 'Members table accessible',
      count: members[0].count,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Members test error:', error);
    res.status(500).json({ 
      error: 'Members table access failed',
      details: error.message 
    });
  }
});

module.exports = router;
