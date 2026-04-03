const mysql = require('mysql2/promise');

// TiDB Cloud credentials
const connectionConfig = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3YcYtVHpR3uqqKo.root',
  password: 'rLCgQu4liNYBU9On',
  ssl: { rejectUnauthorized: false }
};

async function createDatabaseAndTables() {
  let connection;
  
  try {
    console.log('🔌 Connecting to TiDB Cloud...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to TiDB Cloud successfully!');

    // Create database
    console.log('📊 Creating database sportgym_db...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS sportgym_db');
    console.log('✅ Database sportgym_db created successfully!');

    // Switch to the new database
    await connection.execute('USE sportgym_db');
    console.log('🔄 Switched to sportgym_db database');

    // Create tables
    console.log('📋 Creating tables...');

    // Users table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff', 'member') DEFAULT 'member',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Users table created');

    // Members table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS members (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        membership_type ENUM('basic', 'premium', 'vip') DEFAULT 'basic',
        membership_status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
        join_date DATE DEFAULT CURRENT_DATE,
        expiry_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Members table created');

    // Payments table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        payment_type ENUM('membership', 'training', 'equipment', 'other') NOT NULL,
        payment_method ENUM('cash', 'card', 'bank_transfer', 'online') NOT NULL,
        payment_date DATE DEFAULT CURRENT_DATE,
        status ENUM('paid', 'pending', 'failed', 'refunded') DEFAULT 'paid',
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Payments table created');

    // Attendance table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        member_id INT NOT NULL,
        check_in_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        check_out_time TIMESTAMP NULL,
        date DATE DEFAULT CURRENT_DATE,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Attendance table created');

    // Announcements table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('general', 'urgent', 'event', 'maintenance') DEFAULT 'general',
        status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
        author_id INT,
        publish_date TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('✅ Announcements table created');

    // Insert sample data
    console.log('📝 Inserting sample data...');

    // Insert admin user
    await connection.execute(`
      INSERT IGNORE INTO users (username, email, password, role) 
      VALUES ('admin', 'admin@sportgym.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
    `);
    console.log('✅ Admin user created');

    // Insert sample member
    await connection.execute(`
      INSERT IGNORE INTO members (first_name, last_name, email, phone, membership_type, membership_status) 
      VALUES ('John', 'Doe', 'john.doe@email.com', '+1234567890', 'premium', 'active')
    `);
    console.log('✅ Sample member created');

    // Insert sample announcement
    await connection.execute(`
      INSERT IGNORE INTO announcements (title, content, type, status, author_id, publish_date) 
      VALUES ('Welcome to Sport Gym Management', 'This is a sample announcement to test the system.', 'general', 'published', 1, NOW())
    `);
    console.log('✅ Sample announcement created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📊 Database Summary:');
    
    // Show table info
    const [tables] = await connection.execute('SHOW TABLES');
    console.log(`\n✅ Created ${tables.length} tables:`);
    tables.forEach(table => console.log(`   - ${Object.values(table)[0]}`));

    // Show user count
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`\n👥 Users: ${userCount[0].count}`);

    // Show member count
    const [memberCount] = await connection.execute('SELECT COUNT(*) as count FROM members');
    console.log(`🏃 Members: ${memberCount[0].count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed');
    }
  }
}

// Run the setup
createDatabaseAndTables().catch(console.error);
