const express = require('express');
const { pool } = require('../config/database');

const router = express.Router();

// Get all payments
router.get('/', async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, m.name as member_name 
      FROM payments p 
      LEFT JOIN members m ON p.member_id = m.id 
      ORDER BY p.date DESC
    `);
    res.json(payments);
  } catch (error) {
    console.error('Get payments error:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const [payments] = await pool.query(`
      SELECT p.*, m.name as member_name 
      FROM payments p 
      LEFT JOIN members m ON p.member_id = m.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payments[0]);
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
});

// Get payments by member ID
router.get('/member/:memberId', async (req, res) => {
  try {
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE member_id = ? ORDER BY date DESC',
      [req.params.memberId]
    );
    res.json(payments);
  } catch (error) {
    console.error('Get member payments error:', error);
    res.status(500).json({ error: 'Failed to fetch member payments' });
  }
});

// Create new payment
router.post('/', async (req, res) => {
  try {
    const {
      member_id, amount, payment_type, payment_date, status = 'paid', payment_method, description
    } = req.body;

    // Generate numeric payment ID
    const paymentId = Date.now();

    const [result] = await pool.query(`
      INSERT INTO payments (
        id, member_id, amount, payment_type, payment_date, status, payment_method, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      paymentId, member_id, amount, payment_type, payment_date, status, payment_method, description
    ]);

    res.status(201).json({
      message: 'Payment created successfully',
      payment: { id: paymentId, ...req.body }
    });
  } catch (error) {
    console.error('Create payment error:', error);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error errno:', error.errno);
    console.error('Error sqlMessage:', error.sqlMessage);
    console.error('Error sqlState:', error.sqlState);
    res.status(500).json({ error: 'Failed to create payment', details: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const {
      member_id, amount, type, date, status, payment_method, notes
    } = req.body;

    const [result] = await pool.query(`
      UPDATE payments SET
        member_id = ?, amount = ?, type = ?, date = ?, status = ?,
        payment_method = ?, notes = ?
      WHERE id = ?
    `, [
      member_id, amount, type, date, status, payment_method, notes, req.params.id
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ message: 'Payment updated successfully' });
  } catch (error) {
    console.error('Update payment error:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM payments WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
});

// Get payment statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [totalRevenue] = await pool.query(
      'SELECT SUM(amount) as total FROM payments WHERE status = "payé"'
    );
    
    const [monthlyRevenue] = await pool.query(`
      SELECT SUM(amount) as monthly_total, MONTH(date) as month, YEAR(date) as year
      FROM payments 
      WHERE status = "payé" AND date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
      GROUP BY MONTH(date), YEAR(date)
      ORDER BY year DESC, month DESC
    `);

    const [paymentCounts] = await pool.query(`
      SELECT type, COUNT(*) as count, SUM(amount) as total
      FROM payments 
      WHERE status = "payé" AND date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY type
    `);

    res.json({
      total_revenue: totalRevenue[0].total || 0,
      monthly_revenue: monthlyRevenue,
      payment_counts: paymentCounts
    });
  } catch (error) {
    console.error('Get payment stats error:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
});

module.exports = router;
