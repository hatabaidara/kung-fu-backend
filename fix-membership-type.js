const mysql = require('mysql2/promise');
require('dotenv').config();

// TiDB connection configuration for Render deployment
const dbConfig = {
  host: process.env.TIDB_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: process.env.TIDB_PORT || 4000,
  user: process.env.TIDB_USER || 'your_username_here',
  password: process.env.TIDB_PASSWORD || 'your_password_here',
  database: process.env.TIDB_DATABASE || 'sportgym_db',
  ssl: {
    rejectUnauthorized: false
  },
  connectionLimit: 10,
  charset: 'utf8mb4',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

async function fix() {
  try {
    console.log('Connecting to TiDB database...');
    
    // Get connection from pool
    const connection = await pool.getConnection();
    console.log('Successfully connected to TiDB database');
    
    // Check current columns
    const [cols] = await connection.query('DESCRIBE members');
    console.log('Current columns:', cols.map(c => `${c.Field}: ${c.Type}`));
    
    // Execute ALTER TABLE queries
    console.log('Altering membership_type column...');
    await connection.query('ALTER TABLE members MODIFY COLUMN membership_type VARCHAR(100)');
    console.log('Fixed membership_type column to VARCHAR(100)');
    
    console.log('Altering membership_status column...');
    await connection.query('ALTER TABLE members MODIFY COLUMN membership_status VARCHAR(50)');
    console.log('Fixed membership_status column to VARCHAR(50)');
    
    console.log('All columns fixed successfully!');
    connection.release();
    
    // Close pool
    await pool.end();
    console.log('Pool closed');
  } catch (error) {
    console.error('Error fixing columns:', error.message);
    console.error('Full error:', error);
  }
}

fix().catch(console.error);
