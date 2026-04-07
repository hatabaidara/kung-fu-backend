const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all announcements
router.get('/', async (req, res) => {
  try {
    const [announcements] = await pool.query(
      'SELECT * FROM announcements WHERE active = TRUE ORDER BY priority DESC, date DESC'
    );
    res.json(announcements);
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// Get announcement by ID
router.get('/:id', async (req, res) => {
  try {
    const [announcements] = await pool.query(
      'SELECT * FROM announcements WHERE id = ?',
      [req.params.id]
    );
    
    if (announcements.length === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }
    
    res.json(announcements[0]);
  } catch (error) {
    console.error('Get announcement error:', error);
    res.status(500).json({ error: 'Failed to fetch announcement' });
  }
});

// Create new announcement
router.post('/', async (req, res) => {
  try {
    const {
      title, content, type = 'general', priority = 'medium',
      date = new Date().toISOString().split('T')[0], author_id, active = true
    } = req.body;

    // Generate announcement ID
    const announcementId = `ANN${Date.now()}`;

    const [result] = await pool.query(`
      INSERT INTO announcements (
        id, title, content, type, priority, date, author_id, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      announcementId, title, content, type, priority, date, author_id, active
    ]);

    res.status(201).json({
      message: 'Announcement created successfully',
      announcement: { id: announcementId, ...req.body }
    });
  } catch (error) {
    console.error('Create announcement error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Error sqlState:', error.sqlState);
    res.status(500).json({ error: 'Failed to create announcement', details: error.message });
  }
});

// Update announcement
router.put('/:id', async (req, res) => {
  try {
    const {
      title, content, type, priority, date, author, active
    } = req.body;

    const [result] = await pool.query(`
      UPDATE announcements SET
        title = ?, content = ?, type = ?, priority = ?, date = ?,
        author = ?, active = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      title, content, type, priority, date, author, active, req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
});

// Delete announcement (soft delete by setting active to false)
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE announcements SET active = FALSE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
});

// Get announcements by type
router.get('/type/:type', async (req, res) => {
  try {
    const [announcements] = await pool.query(
      'SELECT * FROM announcements WHERE type = ? AND active = TRUE ORDER BY priority DESC, date DESC',
      [req.params.type]
    );
    res.json(announcements);
  } catch (error) {
    console.error('Get announcements by type error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements by type' });
  }
});

// Get recent announcements (last 7 days)
router.get('/recent/limit', async (req, res) => {
  try {
    const [announcements] = await pool.query(`
      SELECT * FROM announcements 
      WHERE active = TRUE AND date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      ORDER BY priority DESC, date DESC 
      LIMIT 10
    `);
    res.json(announcements);
  } catch (error) {
    console.error('Get recent announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch recent announcements' });
  }
});

// Toggle announcement active status
router.patch('/:id/toggle', async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE announcements SET active = NOT active WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    res.json({ message: 'Announcement status toggled successfully' });
  } catch (error) {
    console.error('Toggle announcement error:', error);
    res.status(500).json({ error: 'Failed to toggle announcement status' });
  }
});

module.exports = router;
