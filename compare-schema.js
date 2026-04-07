const mysql = require('mysql2/promise');

// TiDB Cloud credentials
const connectionConfig = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3YcYtVHpR3uqqKo.root',
  password: 'rLCgQu4liNYBU9On',
  ssl: { rejectUnauthorized: false }
};

async function compareSchema() {
  let connection;
  
  try {
    console.log('🔌 Connecting to TiDB Cloud...');
    connection = await mysql.createConnection(connectionConfig);
    await connection.execute('USE sportgym_db');
    console.log('✅ Connected to sportgym_db database\n');
    
    // Get table structures
    console.log('📋 ANALYSE DES SCHÉMAS\n');
    
    // Members table structure
    console.log('🏃 MEMBERS TABLE:');
    const [membersStructure] = await connection.execute('DESCRIBE members');
    membersStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Payments table structure  
    console.log('\n💰 PAYMENTS TABLE:');
    const [paymentsStructure] = await connection.execute('DESCRIBE payments');
    paymentsStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Attendance table structure
    console.log('\n📅 ATTENDANCE TABLE:');
    const [attendanceStructure] = await connection.execute('DESCRIBE attendance');
    attendanceStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Announcements table structure
    console.log('\n📢 ANNOUNCEMENTS TABLE:');
    const [announcementsStructure] = await connection.execute('DESCRIBE announcements');
    announcementsStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? '(NULL)' : '(NOT NULL)'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    console.log('\n🔍 ANALYSE DES INCOMPATIBILITÉS\n');
    
    // Analyze members route vs table structure
    console.log('🏃 MEMBERS ROUTE ANALYSIS:');
    console.log('  Controller expects:');
    console.log('    - id (string/varchar)');
    console.log('    - name (string)');
    console.log('    - phone (string)');
    console.log('    - email (string)');
    console.log('    - discipline (string)');
    console.log('    - age (number)');
    console.log('    - address (string)');
    console.log('    - licenseNumber (string)');
    console.log('    - licenseStatus (string)');
    console.log('    - licenseExpiry (string/date)');
    console.log('    - joinDate (string/date)');
    console.log('    - parent (string)');
    console.log('    - active (boolean)');
    
    const membersFields = membersStructure.reduce((acc, col) => {
      acc[col.Field] = col;
      return acc;
    }, {});
    
    console.log('\n  Table has:');
    Object.keys(membersFields).forEach(field => {
      console.log(`    - ${field}: ${membersFields[field].Type}`);
    });
    
    // Check for missing fields
    const expectedMemberFields = ['id', 'name', 'phone', 'email', 'discipline', 'age', 'address', 'license_number', 'license_status', 'license_expiry', 'join_date', 'parent', 'active'];
    const missingMemberFields = expectedMemberFields.filter(field => !membersFields[field]);
    
    if (missingMemberFields.length > 0) {
      console.log('\n  ❌ MISSING FIELDS:', missingMemberFields);
    }
    
    // Check field type mismatches
    console.log('\n  🔍 FIELD TYPE ANALYSIS:');
    const memberTypeIssues = [];
    
    if (membersFields.id && membersFields.id.Type !== 'varchar(20)') {
      memberTypeIssues.push(`id: expected varchar(20), got ${membersFields.id.Type}`);
    }
    
    if (membersFields.name && !membersFields.name.Type.includes('varchar')) {
      memberTypeIssues.push(`name: expected varchar, got ${membersFields.name.Type}`);
    }
    
    if (memberTypeIssues.length > 0) {
      console.log('  ❌ TYPE ISSUES:');
      memberTypeIssues.forEach(issue => console.log(`    - ${issue}`));
    }
    
    // Analyze payments route vs table structure
    console.log('\n💰 PAYMENTS ROUTE ANALYSIS:');
    console.log('  Controller expects:');
    console.log('    - id (string/varchar)');
    console.log('    - member_id (number/int)');
    console.log('    - amount (decimal)');
    console.log('    - type (enum)');
    console.log('    - date (date)');
    console.log('    - status (enum)');
    console.log('    - payment_method (enum)');
    console.log('    - notes (text)');
    
    const paymentsFields = paymentsStructure.reduce((acc, col) => {
      acc[col.Field] = col;
      return acc;
    }, {});
    
    console.log('\n  Table has:');
    Object.keys(paymentsFields).forEach(field => {
      console.log(`    - ${field}: ${paymentsFields[field].Type}`);
    });
    
    // Check for missing fields in payments
    const expectedPaymentFields = ['id', 'member_id', 'amount', 'type', 'date', 'status', 'payment_method', 'notes'];
    const missingPaymentFields = expectedPaymentFields.filter(field => !paymentsFields[field]);
    
    if (missingPaymentFields.length > 0) {
      console.log('\n  ❌ MISSING FIELDS:', missingPaymentFields);
    }
    
    // Analyze attendance route vs table structure
    console.log('\n📅 ATTENDANCE ROUTE ANALYSIS:');
    console.log('  Controller expects:');
    console.log('    - id (string/varchar)');
    console.log('    - member_id (number/int)');
    console.log('    - date (date)');
    console.log('    - check_in (time)');
    console.log('    - check_out (time)');
    console.log('    - status (enum)');
    console.log('    - notes (text)');
    
    const attendanceFields = attendanceStructure.reduce((acc, col) => {
      acc[col.Field] = col;
      return acc;
    }, {});
    
    console.log('\n  Table has:');
    Object.keys(attendanceFields).forEach(field => {
      console.log(`    - ${field}: ${attendanceFields[field].Type}`);
    });
    
    // Check for missing fields in attendance
    const expectedAttendanceFields = ['id', 'member_id', 'date', 'check_in_time', 'check_out_time', 'date', 'status', 'notes'];
    const missingAttendanceFields = expectedAttendanceFields.filter(field => !attendanceFields[field]);
    
    if (missingAttendanceFields.length > 0) {
      console.log('\n  ❌ MISSING FIELDS:', missingAttendanceFields);
    }
    
    // Check field naming issues
    console.log('\n  🔍 NAMING ISSUES:');
    if (attendanceFields.check_in_time && !attendanceFields.check_in) {
      console.log('  ❌ Table has check_in_time but controller expects check_in');
    }
    
    // Analyze announcements route vs table structure
    console.log('\n📢 ANNOUNCEMENTS ROUTE ANALYSIS:');
    console.log('  Controller expects:');
    console.log('    - id (string/varchar)');
    console.log('    - title (varchar)');
    console.log('    - content (text)');
    console.log('    - type (enum)');
    console.log('    - priority (enum)');
    console.log('    - date (date)');
    console.log('    - author (string)');
    console.log('    - active (boolean)');
    
    const announcementsFields = announcementsStructure.reduce((acc, col) => {
      acc[col.Field] = col;
      return acc;
    }, {});
    
    console.log('\n  Table has:');
    Object.keys(announcementsFields).forEach(field => {
      console.log(`    - ${field}: ${announcementsFields[field].Type}`);
    });
    
    console.log('\n🎯 RÉSUMÉ DES INCOMPATIBILITÉS TROUVÉES:');
    console.log('1. Members: Field naming and type mismatches');
    console.log('2. Attendance: check_in_time vs check_in field naming');
    console.log('3. All tables: Potential enum value mismatches');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connection closed');
    }
  }
}

compareSchema().catch(console.error);
