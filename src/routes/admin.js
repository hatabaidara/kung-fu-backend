const express = require('express');
const { pool } = require('../config/database-tidb-render');

const router = express.Router();

// Alter table endpoint
router.post('/alter-table', async (req, res) => {
  try {
    const { query } = req.body;
    await pool.query(query);
    res.json({ message: 'Table altered successfully' });
  } catch (error) {
    console.error('Alter table error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fix members table columns
router.post('/fix-members-columns', async (req, res) => {
  try {
    console.log('🔧 Fixing members table columns...');
    
    // Check current columns
    const [cols] = await pool.query('DESCRIBE members');
    console.log('Current columns:', cols.map(c => `${c.Field}: ${c.Type}`));
    
    // Alter membership_type column
    await pool.query('ALTER TABLE members MODIFY COLUMN membership_type VARCHAR(100)');
    console.log('✅ Fixed membership_type column to VARCHAR(100)');
    
    // Alter membership_status column  
    await pool.query('ALTER TABLE members MODIFY COLUMN membership_status VARCHAR(50)');
    console.log('✅ Fixed membership_status column to VARCHAR(50)');
    
    res.json({ 
      message: 'Members table columns fixed successfully',
      columns: [
        { name: 'membership_type', type: 'VARCHAR(100)' },
        { name: 'membership_status', type: 'VARCHAR(50)' }
      ]
    });
  } catch (error) {
    console.error('❌ Error fixing members columns:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
