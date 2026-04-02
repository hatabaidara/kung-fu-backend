const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration for local development without TiDB
const getLocalConfig = () => {
  // Try to connect to local MySQL first, fallback to SQLite simulation
  return {
    host: process.env.MYSQL_HOST || 'localhost',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'sportgym_local',
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000
  };
};

// Fallback to in-memory storage for development
class InMemoryDatabase {
  constructor() {
    this.users = [];
    this.members = [];
    this.payments = [];
    this.attendance = [];
    this.announcements = [];
    this.nextId = 1;
  }

  async query(sql, params = []) {
    console.log(`[IN-MEMORY DB] ${sql}`, params);
    
    // Simple query simulation for basic operations
    if (sql.includes('SELECT') && sql.includes('members')) {
      return [this.members];
    }
    if (sql.includes('INSERT') && sql.includes('members')) {
      const newMember = {
        id: `M${this.nextId++}`,
        ...params[1],
        created_at: new Date(),
        updated_at: new Date()
      };
      this.members.push(newMember);
      return [{ insertId: newMember.id }];
    }
    if (sql.includes('SELECT') && sql.includes('users')) {
      return [this.users];
    }
    if (sql.includes('INSERT') && sql.includes('users')) {
      const newUser = {
        id: this.nextId++,
        ...params[1],
        created_at: new Date(),
        updated_at: new Date()
      };
      this.users.push(newUser);
      return [{ insertId: newUser.id }];
    }
    
    // Default response
    return [{ affectedRows: 1 }];
  }

  async getConnection() {
    return {
      query: this.query.bind(this),
      release: () => {}
    };
  }
}

const inMemoryDb = new InMemoryDatabase();

// Create connection pool
let pool;
let usingInMemory = false;

async function initializePool() {
  try {
    // Try MySQL first
    const mysqlPool = mysql.createPool(getLocalConfig());
    const connection = await mysqlPool.getConnection();
    console.log('✅ Connected to local MySQL database');
    connection.release();
    pool = mysqlPool;
    return true;
  } catch (error) {
    console.log('⚠️ MySQL not available, using in-memory database for development');
    pool = inMemoryDb;
    usingInMemory = true;
    return false;
  }
}

// Test database connection
async function testConnection() {
  if (usingInMemory) {
    console.log('✅ Using in-memory database (development mode)');
    return true;
  }

  try {
    const connection = await pool.getConnection();
    console.log('✅ Successfully connected to local database');
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
    if (usingInMemory) {
      console.log('✅ In-memory database initialized with sample data');
      
      // Add sample data
      inMemoryDb.members = [
        {
          id: "M001",
          name: "Ahmed Diallo",
          phone: "77 123 45 67",
          email: "ahmed.diallo@email.com",
          discipline: "Boxe",
          age: 25,
          address: "Dakar, Plateau",
          license_number: "BOX2024001",
          license_status: "Actif",
          license_expiry: "2025-01-15",
          join_date: "2024-01-15",
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: "M002",
          name: "Fatou Sène",
          phone: "76 234 56 78",
          email: "fatou.sene@email.com",
          discipline: "Kung Fu",
          age: 22,
          address: "Dakar, Sacré-Coeur",
          license_number: "KF2024002",
          license_status: "Actif",
          license_expiry: "2025-02-20",
          join_date: "2024-02-20",
          active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ];
      
      return;
    }

    const dbName = process.env.MYSQL_DATABASE || 'sportgym_local';
    
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

    console.log('✅ Database tables initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    throw error;
  }
}

// Initialize on module load
initializePool().then(() => {
  console.log('Database pool initialized');
}).catch(console.error);

module.exports = {
  pool,
  testConnection,
  initializeDatabase,
  usingInMemory: () => usingInMemory
};
