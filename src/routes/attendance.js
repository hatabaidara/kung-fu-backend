const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all attendance records
router.get('/', async (req, res) => {
  try {
    const [attendance] = await pool.query(`
      SELECT a.*, m.name as member_name, m.discipline 
      FROM attendance a 
      LEFT JOIN members m ON a.member_id = m.id 
      ORDER BY a.date DESC, a.check_in DESC
    `);
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance records' });
  }
});

// Get attendance by ID
router.get('/:id', async (req, res) => {
  try {
    const [attendance] = await pool.query(`
      SELECT a.*, m.name as member_name, m.discipline 
      FROM attendance a 
      LEFT JOIN members m ON a.member_id = m.id 
      WHERE a.id = ?
    `, [req.params.id]);
    
    if (attendance.length === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }
    
    res.json(attendance[0]);
  } catch (error) {
    console.error('Get attendance record error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance record' });
  }
});

// Get attendance by member ID
router.get('/member/:memberId', async (req, res) => {
  try {
    const [attendance] = await pool.query(
      'SELECT * FROM attendance WHERE member_id = ? ORDER BY date DESC',
      [req.params.memberId]
    );
    res.json(attendance);
  } catch (error) {
    console.error('Get member attendance error:', error);
    res.status(500).json({ error: 'Failed to fetch member attendance' });
  }
});

// Get attendance by date
router.get('/date/:date', async (req, res) => {
  try {
    const [attendance] = await pool.query(`
      SELECT a.*, m.name as member_name, m.discipline 
      FROM attendance a 
      LEFT JOIN members m ON a.member_id = m.id 
      WHERE a.date = ?
      ORDER BY a.check_in ASC
    `, [req.params.date]);
    res.json(attendance);
  } catch (error) {
    console.error('Get attendance by date error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance for date' });
  }
});

// Check-in member
router.post('/checkin', async (req, res) => {
  try {
    const { member_id, date = new Date().toISOString().split('T')[0] } = req.body;

    // Check if member exists
    const [members] = await pool.query(
      'SELECT id, name FROM members WHERE id = ? AND active = TRUE',
      [member_id]
    );

    if (members.length === 0) {
      return res.status(404).json({ error: 'Member not found or inactive' });
    }

    // Check if already checked in today
    const [existing] = await pool.query(
      'SELECT id FROM attendance WHERE member_id = ? AND date = ?',
      [member_id, date]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Member already checked in today' });
    }

    // Generate attendance ID
    const attendanceId = `A${Date.now()}`;
    const checkInTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const [result] = await pool.query(`
      INSERT INTO attendance (id, member_id, date, check_in_time, status)
      VALUES (?, ?, ?, ?, 'present')
    `, [attendanceId, member_id, date, checkInTime]);

    res.status(201).json({
      message: 'Check-in successful',
      attendance: {
        id: attendanceId,
        member_id,
        date,
        check_in: checkInTime,
        status: 'présent'
      }
    });
  } catch (error) {
    console.error('Check-in error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Error sqlState:', error.sqlState);
    res.status(500).json({ error: 'Failed to check in member', details: error.message });
  }
});

// Check-out member
router.put('/checkout/:id', async (req, res) => {
  try {
    const checkOutTime = new Date().toTimeString().split(' ')[0].substring(0, 5);

    const [result] = await pool.query(
      'UPDATE attendance SET check_out = ? WHERE id = ? AND check_out IS NULL',
      [checkOutTime, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Attendance record not found or already checked out' });
    }

    res.json({ message: 'Check-out successful' });
  } catch (error) {
    console.error('Check-out error:', error);
    res.status(500).json({ error: 'Failed to check out member' });
  }
});

// Create attendance record
router.post('/', async (req, res) => {
  try {
    const {
      member_id, date, check_in, check_out, status = 'présent', notes
    } = req.body;

    // Generate attendance ID
    const attendanceId = `A${Date.now()}`;

    const [result] = await pool.query(`
      INSERT INTO attendance (
        id, member_id, date, check_in, check_out, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      attendanceId, member_id, date, check_in, check_out, status, notes
    ]);

    res.status(201).json({
      message: 'Attendance record created successfully',
      attendance: { id: attendanceId, ...req.body }
    });
  } catch (error) {
    console.error('Create attendance error:', error);
    res.status(500).json({ error: 'Failed to create attendance record' });
  }
});

// Update attendance record
router.put('/:id', async (req, res) => {
  try {
    const {
      member_id, date, check_in, check_out, status, notes
    } = req.body;

    const [result] = await pool.query(`
      UPDATE attendance SET
        member_id = ?, date = ?, check_in = ?, check_out = ?, status = ?, notes = ?
      WHERE id = ?
    `, [
      member_id, date, check_in, check_out, status, notes, req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record updated successfully' });
  } catch (error) {
    console.error('Update attendance error:', error);
    res.status(500).json({ error: 'Failed to update attendance record' });
  }
});

// Delete attendance record
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM attendance WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Attendance record not found' });
    }

    res.json({ message: 'Attendance record deleted successfully' });
  } catch (error) {
    console.error('Delete attendance error:', error);
    res.status(500).json({ error: 'Failed to delete attendance record' });
  }
});

// Get attendance statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [todayStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_attendance,
        SUM(CASE WHEN status = 'présent' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'retard' THEN 1 ELSE 0 END) as late
      FROM attendance 
      WHERE date = CURDATE()
    `);

    const [weeklyStats] = await pool.query(`
      SELECT 
        DATE(date) as date,
        COUNT(*) as total,
        SUM(CASE WHEN status = 'présent' THEN 1 ELSE 0 END) as present
      FROM attendance 
      WHERE date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
      GROUP BY DATE(date)
      ORDER BY date DESC
    `);

    res.json({
      today: todayStats[0],
      weekly: weeklyStats
    });
  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ error: 'Failed to fetch attendance statistics' });
  }
});

module.exports = router;
