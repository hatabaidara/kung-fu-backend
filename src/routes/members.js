const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Get all members
router.get('/', async (req, res) => {
  try {
    const [members] = await pool.query(
      'SELECT * FROM members ORDER BY created_at DESC'
    );
    res.json(members);
  } catch (error) {
    console.error('Get members error:', error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// Get member by ID
router.get('/:id', async (req, res) => {
  try {
    const [members] = await pool.query(
      'SELECT * FROM members WHERE id = ?',
      [req.params.id]
    );
    
    if (members.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }
    
    res.json(members[0]);
  } catch (error) {
    console.error('Get member error:', error);
    res.status(500).json({ error: 'Failed to fetch member' });
  }
});

// Create new member
router.post('/', async (req, res) => {
  try {
    const {
      id, name, phone, email, discipline, age, address,
      licenseNumber, licenseStatus, licenseExpiry, joinDate, parent, active
    } = req.body;

    // Generate member ID if not provided
    const memberId = id || `M${Date.now()}`;

    const [result] = await pool.query(`
      INSERT INTO members (
        id, name, phone, email, discipline, age, address,
        license_number, license_status, license_expiry, join_date, parent, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      memberId, name, phone, email, discipline, age, address,
      licenseNumber, licenseStatus, licenseExpiry, joinDate, parent, active !== false
    ]);

    res.status(201).json({
      message: 'Member created successfully',
      member: { id: memberId, ...req.body }
    });
  } catch (error) {
    console.error('Create member error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ error: 'Member ID already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create member' });
    }
  }
});

// Update member
router.put('/:id', async (req, res) => {
  try {
    const {
      name, phone, email, discipline, age, address,
      licenseNumber, licenseStatus, licenseExpiry, joinDate, parent, active
    } = req.body;

    const [result] = await pool.query(`
      UPDATE members SET
        name = ?, phone = ?, email = ?, discipline = ?, age = ?, address = ?,
        license_number = ?, license_status = ?, license_expiry = ?, join_date = ?,
        parent = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      name, phone, email, discipline, age, address,
      licenseNumber, licenseStatus, licenseExpiry, joinDate, parent, active !== false,
      req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member updated successfully' });
  } catch (error) {
    console.error('Update member error:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// Delete member
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM members WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member deleted successfully' });
  } catch (error) {
    console.error('Delete member error:', error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// Search members
router.get('/search/:query', async (req, res) => {
  try {
    const query = req.params.query;
    const [members] = await pool.query(`
      SELECT * FROM members 
      WHERE name LIKE ? OR phone LIKE ? OR email LIKE ? OR discipline LIKE ?
      ORDER BY name ASC
    `, [`%${query}%`, `%${query}%`, `%${query}%`, `%${query}%`]);

    res.json(members);
  } catch (error) {
    console.error('Search members error:', error);
    res.status(500).json({ error: 'Failed to search members' });
  }
});

module.exports = router;
