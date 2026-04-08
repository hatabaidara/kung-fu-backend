const mysql = require('mysql2/promise');
require('dotenv').config();

// TiDB connection configuration
const dbConfig = {
  host: process.env.TIDB_HOST || 'localhost',
  port: process.env.TIDB_PORT || 4000,
  user: process.env.TIDB_USER || 'root',
  password: process.env.TIDB_PASSWORD || '',
  database: process.env.TIDB_DATABASE || 'sportgym_db',
  ssl: {
    rejectUnauthorized: false
  },
  connectionLimit: 10,
  charset: 'utf8mb4'
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to TiDB database');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error.message);
    return false;
  }
}

// Initialize database tables
async function initializeDatabase() {
  try {
    console.log('🔌 Initializing database connection...');
    console.log('📊 Database config:', {
      host: process.env.TIDB_HOST,
      port: process.env.TIDB_PORT,
      user: process.env.TIDB_USER,
      database: process.env.TIDB_DATABASE
    });
    
    // Test connection and use existing database
    const connection = await pool.getConnection();
    await connection.query(`USE ${process.env.TIDB_DATABASE || 'sportgym_db'}`);
    
    // Check if tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Connected to database with ${tables.length} tables`);
    
    // Just verify the database exists and is accessible
    const [result] = await connection.query('SELECT 1 as test');
    if (result[0].test === 1) {
      console.log('✅ Database connection verified and ready');
    }
    
    connection.release();
    console.log('✅ Database initialization completed successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('❌ Full error details:', error);
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
