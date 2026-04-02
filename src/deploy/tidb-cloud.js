// Configuration pour TiDB Cloud
const { initializeDatabase, testConnection } = require('../config/database');

// Configuration TiDB Cloud
const tidbCloudConfig = {
  host: process.env.TIDB_CLOUD_HOST || 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
  port: process.env.TIDB_CLOUD_PORT || 4000,
  user: process.env.TIDB_CLOUD_USER || 'your_username',
  password: process.env.TIDB_CLOUD_PASSWORD || 'your_password',
  database: process.env.TIDB_CLOUD_DATABASE || 'sportgym_db',
  ssl: {
    rejectUnauthorized: false
  }
};

// Update database configuration for TiDB Cloud
async function setupTiDBCloud() {
  console.log('🚀 Setting up TiDB Cloud connection...');
  
  // Update the pool configuration
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    ...tidbCloudConfig,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
  });

  try {
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to TiDB Cloud');
    connection.release();

    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized successfully');

    return pool;
  } catch (error) {
    console.error('❌ Failed to connect to TiDB Cloud:', error.message);
    throw error;
  }
}

// Export for use in main application
module.exports = { setupTiDBCloud, tidbCloudConfig };
