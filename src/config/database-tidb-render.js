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

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to TiDB database on Render');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('❌ Connection config:', {
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT,
      user: process.env.TIDB_USER,
      database: process.env.TIDB_DATABASE,
      hasPassword: !!process.env.TIDB_PASSWORD
    });
    return false;
  }
}

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('🔌 Initializing TiDB database connection on Render...');
    console.log('📊 Database config:', {
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT,
      user: process.env.TIDB_USER,
      database: process.env.TIDB_DATABASE
    });
    
    // Test connection first
    const connection = await pool.getConnection();
    
    // Use the database
    await connection.query(`USE ${process.env.TIDB_DATABASE || 'sportgym_db'}`);
    
    // Check if tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Connected to TiDB database with ${tables.length} tables`);
    
    // Test basic query
    const [result] = await connection.query('SELECT 1 as test');
    if (result[0].test === 1) {
      console.log('✅ TiDB database connection verified and ready');
    }
    
    connection.release();
    console.log('✅ TiDB database initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing TiDB database:', error.message);
    console.error('❌ Full error details:', error);
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
