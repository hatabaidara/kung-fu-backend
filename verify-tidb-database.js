const mysql = require('mysql2/promise');

// TiDB Cloud credentials
const connectionConfig = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3YcYtVHpR3uqqKo.root',
  password: 'rLCgQu4liNYBU9On',
  ssl: { rejectUnauthorized: false }
};

async function verifyTiDBDatabase() {
  let connection;
  
  try {
    console.log('🔌 Connecting to TiDB Cloud...');
    connection = await mysql.createConnection(connectionConfig);
    console.log('✅ Connected to TiDB Cloud successfully!');

    // Check if sportgym_db exists
    console.log('\n📊 Checking databases...');
    const [databases] = await connection.execute('SHOW DATABASES');
    const sportgymDbExists = databases.some(db => db.Database === 'sportgym_db');
    
    console.log('Available databases:');
    databases.forEach(db => {
      console.log(`  - ${db.Database}`);
    });
    
    if (sportgymDbExists) {
      console.log('\n✅ sportgym_db database found!');
      
      // Switch to sportgym_db
      await connection.execute('USE sportgym_db');
      console.log('🔄 Switched to sportgym_db database');
      
      // Check tables
      console.log('\n📋 Checking tables...');
      const [tables] = await connection.execute('SHOW TABLES');
      
      if (tables.length > 0) {
        console.log(`✅ Found ${tables.length} tables:`);
        tables.forEach(table => {
          console.log(`  - ${Object.values(table)[0]}`);
        });
        
        // Check table structures and data
        console.log('\n🔍 Verifying table structures and data...');
        
        // Users table
        try {
          const [users] = await connection.execute('DESCRIBE users');
          console.log('\n👥 Users table structure:');
          users.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
          
          const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
          console.log(`📊 Users count: ${userCount[0].count}`);
          
          if (userCount[0].count > 0) {
            const [sampleUsers] = await connection.execute('SELECT username, email, role FROM users LIMIT 3');
            console.log('📝 Sample users:');
            sampleUsers.forEach(user => {
              console.log(`  - ${user.username} (${user.email}) - ${user.role}`);
            });
          }
        } catch (error) {
          console.log('❌ Users table error:', error.message);
        }
        
        // Members table
        try {
          const [members] = await connection.execute('DESCRIBE members');
          console.log('\n🏃 Members table structure:');
          members.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
          
          const [memberCount] = await connection.execute('SELECT COUNT(*) as count FROM members');
          console.log(`📊 Members count: ${memberCount[0].count}`);
          
          if (memberCount[0].count > 0) {
            const [sampleMembers] = await connection.execute('SELECT first_name, last_name, email, membership_type FROM members LIMIT 3');
            console.log('📝 Sample members:');
            sampleMembers.forEach(member => {
              console.log(`  - ${member.first_name} ${member.last_name} (${member.email}) - ${member.membership_type}`);
            });
          }
        } catch (error) {
          console.log('❌ Members table error:', error.message);
        }
        
        // Payments table
        try {
          const [payments] = await connection.execute('DESCRIBE payments');
          console.log('\n💰 Payments table structure:');
          payments.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
          
          const [paymentCount] = await connection.execute('SELECT COUNT(*) as count FROM payments');
          console.log(`📊 Payments count: ${paymentCount[0].count}`);
        } catch (error) {
          console.log('❌ Payments table error:', error.message);
        }
        
        // Attendance table
        try {
          const [attendance] = await connection.execute('DESCRIBE attendance');
          console.log('\n📅 Attendance table structure:');
          attendance.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
          
          const [attendanceCount] = await connection.execute('SELECT COUNT(*) as count FROM attendance');
          console.log(`📊 Attendance records count: ${attendanceCount[0].count}`);
        } catch (error) {
          console.log('❌ Attendance table error:', error.message);
        }
        
        // Announcements table
        try {
          const [announcements] = await connection.execute('DESCRIBE announcements');
          console.log('\n📢 Announcements table structure:');
          announcements.forEach(col => console.log(`  - ${col.Field}: ${col.Type}`));
          
          const [announcementCount] = await connection.execute('SELECT COUNT(*) as count FROM announcements');
          console.log(`📊 Announcements count: ${announcementCount[0].count}`);
          
          if (announcementCount[0].count > 0) {
            const [sampleAnnouncements] = await connection.execute('SELECT title, type, status FROM announcements LIMIT 3');
            console.log('📝 Sample announcements:');
            sampleAnnouncements.forEach(announcement => {
              console.log(`  - ${announcement.title} (${announcement.type}) - ${announcement.status}`);
            });
          }
        } catch (error) {
          console.log('❌ Announcements table error:', error.message);
        }
        
        // Test database operations
        console.log('\n🧪 Testing database operations...');
        
        // Test insert
        const [insertResult] = await connection.execute(`
          INSERT INTO users (username, email, password, role) 
          VALUES ('test_user', 'test@example.com', 'hashed_password', 'member')
          ON DUPLICATE KEY UPDATE email = email
        `);
        console.log(`✅ Test insert result: ${insertResult.affectedRows} rows affected`);
        
        // Test select
        const [selectResult] = await connection.execute('SELECT username, email, role FROM users WHERE username = ?', ['test_user']);
        if (selectResult.length > 0) {
          console.log(`✅ Test select successful: ${selectResult[0].username} found`);
        }
        
        // Test update
        const [updateResult] = await connection.execute('UPDATE users SET role = ? WHERE username = ?', ['staff', 'test_user']);
        console.log(`✅ Test update result: ${updateResult.affectedRows} rows affected`);
        
        // Test delete
        const [deleteResult] = await connection.execute('DELETE FROM users WHERE username = ?', ['test_user']);
        console.log(`✅ Test delete result: ${deleteResult.affectedRows} rows affected`);
        
        console.log('\n🎉 Database verification completed successfully!');
        console.log('\n📊 Database Summary:');
        console.log(`  - Database: sportgym_db ✅`);
        console.log(`  - Tables: ${tables.length} ✅`);
        console.log(`  - Operations: CRUD working ✅`);
        
      } else {
        console.log('❌ No tables found in sportgym_db database');
      }
      
    } else {
      console.log('❌ sportgym_db database NOT found!');
      console.log('Available databases:');
      databases.forEach(db => console.log(`  - ${db.Database}`));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed');
    }
  }
}

// Run the verification
verifyTiDBDatabase().catch(console.error);
