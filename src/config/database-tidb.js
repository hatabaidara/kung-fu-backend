const mysql = require('mysql2/promise');
require('dotenv').config();

// TiDB configuration for production deployment
const getTiDBConfig = () => {
  // Check if using TiDB Cloud
  if (process.env.TIDB_CLOUD_HOST) {
    return {
      host: process.env.TIDB_CLOUD_HOST,
      port: process.env.TIDB_CLOUD_PORT || 4000,
      user: process.env.TIDB_CLOUD_USER,
      password: process.env.TIDB_CLOUD_PASSWORD,
      database: process.env.TIDB_CLOUD_DATABASE || 'sportgym_db',
      ssl: {
        rejectUnauthorized: false
      },
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000
    };
  }

  // Local TiDB configuration
  return {
    host: process.env.TIDB_HOST || 'localhost',
    port: process.env.TIDB_PORT || 4000,
    user: process.env.TIDB_USER || 'root',
    password: process.env.TIDB_PASSWORD || '',
    database: process.env.TIDB_DATABASE || 'sportgym_db',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
  };
};

// Create connection pool
const pool = mysql.createPool(getTiDBConfig());

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to TiDB database');
    console.log(`📍 Host: ${process.env.TIDB_CLOUD_HOST || process.env.TIDB_HOST || 'localhost'}`);
    console.log(`🔌 Port: ${process.env.TIDB_CLOUD_PORT || process.env.TIDB_PORT || 4000}`);
    console.log(`🗄️  Database: ${process.env.TIDB_CLOUD_DATABASE || process.env.TIDB_DATABASE || 'sportgym_db'}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

// Initialize database tables
async function initializeDatabase() {
  try {
    const dbName = process.env.TIDB_CLOUD_DATABASE || process.env.TIDB_DATABASE || 'sportgym_db';
    
    // Create database if not exists
    await pool.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await pool.query(`USE \`${dbName}\``);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_username (username),
        INDEX idx_email (email)
      )
    `);

    // Create members table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS members (
        id VARCHAR(20) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        discipline VARCHAR(50),
        age INT,
        address TEXT,
        license_number VARCHAR(50),
        license_status ENUM('Actif', 'Expiré', 'En attente') DEFAULT 'En attente',
        license_expiry DATE,
        join_date DATE,
        parent VARCHAR(100),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_name (name),
        INDEX idx_discipline (discipline),
        INDEX idx_active (active)
      )
    `);

    // Create payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(20) PRIMARY KEY,
        member_id VARCHAR(20),
        amount DECIMAL(10,2) NOT NULL,
        type ENUM('mensualité', 'inscription', 'renouvellement') NOT NULL,
        date DATE NOT NULL,
        status ENUM('payé', 'en attente', 'retard') DEFAULT 'payé',
        payment_method VARCHAR(50),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
        INDEX idx_member_id (member_id),
        INDEX idx_date (date),
        INDEX idx_status (status)
      )
    `);

    // Create attendance table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        id VARCHAR(20) PRIMARY KEY,
        member_id VARCHAR(20),
        date DATE NOT NULL,
        check_in TIME,
        check_out TIME,
        status ENUM('présent', 'absent', 'retard') DEFAULT 'présent',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
        INDEX idx_member_id (member_id),
        INDEX idx_date (date),
        INDEX idx_status (status)
      )
    `);

    // Create announcements table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(20) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('général', 'compétition', 'entraînement', 'autre') DEFAULT 'général',
        priority ENUM('basse', 'moyenne', 'haute') DEFAULT 'moyenne',
        date DATE NOT NULL,
        author VARCHAR(100),
        active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type),
        INDEX idx_priority (priority),
        INDEX idx_date (date),
        INDEX idx_active (active)
      )
    `);

    console.log('✅ Database tables initialized successfully in TiDB');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  getTiDBConfig
};
