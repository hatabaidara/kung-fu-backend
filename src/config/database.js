const mysql = require('mysql2/promise');
require('dotenv').config();

// TiDB connection configuration
const dbConfig = {
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
    // Create database if not exists
    await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.TIDB_DATABASE || 'sportgym_db'}`);
    await pool.query(`USE ${process.env.TIDB_DATABASE || 'sportgym_db'}`);

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
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
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL
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
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  }
}

module.exports = {
  pool,
  testConnection,
  initializeDatabase
};
