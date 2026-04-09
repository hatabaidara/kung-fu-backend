require('dotenv').config({ path: '.env.render' });
const mysql = require('mysql2/promise');

// Exact same configuration as database-tidb-render.js
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

// Fix user prefix issue - TiDB requires specific prefix format
if (dbConfig.user && dbConfig.user.includes('.root')) {
  // Keep as is - this is the correct format for TiDB Cloud
} else if (dbConfig.user && !dbConfig.user.startsWith('${prefix}')) {
  // Add prefix if missing
  dbConfig.user = `${process.env.TIDB_PREFIX || '2aEf4yH1KpGyJjQ'}.${dbConfig.user}`;
}

// Create connection pool exactly like in database-tidb-render.js
const pool = mysql.createPool(dbConfig);

async function fix() {
  console.log('Using exact same connection as database-tidb-render.js...');
  console.log('Connection config:', {
    host: process.env.TIDB_HOST,
    port: process.env.TIDB_PORT,
    user: process.env.TIDB_USER,
    database: process.env.TIDB_DATABASE,
    hasPassword: !!process.env.TIDB_PASSWORD
  });
  
  try {
    // Test connection first
    const connection = await pool.getConnection();
    console.log('× Successfully connected to TiDB database');
    
    // Check current columns
    const [cols] = await connection.query('DESCRIBE members');
    console.log('Current columns:', cols.map(c => `${c.Field}: ${c.Type}`));
    
    // Execute the two SQL queries
    await connection.query('ALTER TABLE members MODIFY COLUMN membership_type VARCHAR(100)');
    console.log('× Fixed membership_type column to VARCHAR(100)');
    
    await connection.query('ALTER TABLE members MODIFY COLUMN membership_status VARCHAR(50)');
    console.log('× Fixed membership_status column to VARCHAR(50)');
    
    console.log('× All columns fixed successfully!');
    connection.release();
    
    // Close pool
    await pool.end();
    console.log('× Pool closed');
  } catch (error) {
    console.error('Error fixing columns:', error.message);
    console.error('Full error:', error);
  }
}

fix().catch(console.error);
