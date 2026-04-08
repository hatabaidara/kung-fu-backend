// Script pour vérifier directement la base de données TiDB
// Compte les enregistrements AVANT et APRÈS un test d'insertion

const mysql = require('mysql2/promise');
require('dotenv').config();

async function verifyTiDBDatabase() {
  console.log('🔍 VÉRIFICATION DIRECTE DE LA BASE DE DONNÉES TiDB');
  console.log('='.repeat(60));
  
  let connection;
  try {
    // Connexion à TiDB
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
      port: process.env.DB_PORT || '4000',
      user: process.env.DB_USER || '3YcYtVHpR3uqqKo.root',
      password: process.env.DB_PASSWORD || 'your_password_here',
      database: process.env.DB_NAME || 'sportgym_db'
    });

    console.log('✅ Connexion à TiDB réussie');
    console.log('📊 Base de données:', connection.config.database);
    console.log('');

    // Compter les enregistrements AVANT le test
    console.log('📋 ÉTAT AVANT TEST D\'INSERTION:');
    
    const [membersCount] = await connection.execute('SELECT COUNT(*) as count FROM members');
    console.log(`   Members: ${membersCount[0].count} enregistrements`);
    
    const [paymentsCount] = await connection.execute('SELECT COUNT(*) as count FROM payments');
    console.log(`   Payments: ${paymentsCount[0].count} enregistrements`);
    
    const [attendanceCount] = await connection.execute('SELECT COUNT(*) as count FROM attendance');
    console.log(`   Attendance: ${attendanceCount[0].count} enregistrements`);
    
    const [announcementsCount] = await connection.execute('SELECT COUNT(*) as count FROM announcements');
    console.log(`   Announcements: ${announcementsCount[0].count} enregistrements`);
    
    console.log('');

    // Test d'insertion direct dans chaque table
    console.log('🧪 TEST D\'INSERTION DIRECTE:');
    
    // Test Members
    try {
      const [memberResult] = await connection.execute(`
        INSERT INTO members (first_name, last_name, email, membership_type, membership_status) 
        VALUES (?, ?, ?, ?, ?)
      `, ['Test User', 'Direct', 'test@example.com', 'basic', 'active']);
      console.log(`   ✅ Member inséré: ID ${memberResult.insertId}`);
    } catch (error) {
      console.log(`   ❌ Member erreur: ${error.message}`);
    }
    
    // Test Payments
    try {
      const [paymentResult] = await connection.execute(`
        INSERT INTO payments (member_id, amount, payment_type, payment_method, payment_date, status, description) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [1, 25.00, 'membership', 'card', '2026-04-08', 'paid', 'Test payment']);
      console.log(`   ✅ Payment inséré: ID ${paymentResult.insertId}`);
    } catch (error) {
      console.log(`   ❌ Payment erreur: ${error.message}`);
    }
    
    // Test Attendance
    try {
      const [attendanceResult] = await connection.execute(`
        INSERT INTO attendance (member_id, check_in_time, date, notes) 
        VALUES (?, NOW(), ?, ?)
      `, [1, '2026-04-08', 'Test attendance']);
      console.log(`   ✅ Attendance inséré: ID ${attendanceResult.insertId}`);
    } catch (error) {
      console.log(`   ❌ Attendance erreur: ${error.message}`);
    }
    
    // Test Announcements
    try {
      const [announcementResult] = await connection.execute(`
        INSERT INTO announcements (title, content, type, status, author_id, publish_date) 
        VALUES (?, ?, ?, ?, ?, NOW())
      `, ['Test Direct', 'Test content from direct DB connection', 'general', 'published', 1]);
      console.log(`   ✅ Announcement inséré: ID ${announcementResult.insertId}`);
    } catch (error) {
      console.log(`   ❌ Announcement erreur: ${error.message}`);
    }
    
    console.log('');

    // Compter les enregistrements APRÈS le test
    console.log('📋 ÉTAT APRÈS TEST D\'INSERTION:');
    
    const [membersCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM members');
    console.log(`   Members: ${membersCountAfter[0].count} enregistrements (+${membersCountAfter[0].count - membersCount[0].count})`);
    
    const [paymentsCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM payments');
    console.log(`   Payments: ${paymentsCountAfter[0].count} enregistrements (+${paymentsCountAfter[0].count - paymentsCount[0].count})`);
    
    const [attendanceCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM attendance');
    console.log(`   Attendance: ${attendanceCountAfter[0].count} enregistrements (+${attendanceCountAfter[0].count - attendanceCount[0].count})`);
    
    const [announcementsCountAfter] = await connection.execute('SELECT COUNT(*) as count FROM announcements');
    console.log(`   Announcements: ${announcementsCountAfter[0].count} enregistrements (+${announcementsCountAfter[0].count - announcementsCount[0].count})`);
    
    console.log('');

    // Vérifier les derniers enregistrements
    console.log('🔍 DERNIERS ENREGISTREMENTS INSÉRÉS:');
    
    const [lastMember] = await connection.execute('SELECT * FROM members ORDER BY id DESC LIMIT 1');
    if (lastMember.length > 0) {
      console.log(`   Member: ID ${lastMember[0].id}, ${lastMember[0].first_name} ${lastMember[0].last_name}`);
    }
    
    const [lastPayment] = await connection.execute('SELECT * FROM payments ORDER BY id DESC LIMIT 1');
    if (lastPayment.length > 0) {
      console.log(`   Payment: ID ${lastPayment[0].id}, $${lastPayment[0].amount}, ${lastPayment[0].status}`);
    }
    
    const [lastAttendance] = await connection.execute('SELECT * FROM attendance ORDER BY id DESC LIMIT 1');
    if (lastAttendance.length > 0) {
      console.log(`   Attendance: ID ${lastAttendance[0].id}, Member ${lastAttendance[0].member_id}, ${lastAttendance[0].date}`);
    }
    
    const [lastAnnouncement] = await connection.execute('SELECT * FROM announcements ORDER BY id DESC LIMIT 1');
    if (lastAnnouncement.length > 0) {
      console.log(`   Announcement: ID ${lastAnnouncement[0].id}, ${lastAnnouncement[0].title}`);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\n🔌 Connexion fermée');
    }
  }
}

verifyTiDBDatabase().catch(console.error);
