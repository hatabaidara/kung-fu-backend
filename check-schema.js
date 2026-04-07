const mysql = require('mysql2/promise');
const config = {
  host: 'gateway01.eu-central-1.prod.aws.tidbcloud.com',
  port: 4000,
  user: '3YcYtVHpR3uqqKo.root',
  password: 'rLCgQu4liNYBU9On',
  ssl: { rejectUnauthorized: false }
};

async function checkSchema() {
  const connection = await mysql.createConnection(config);
  await connection.execute('USE sportgym_db');
  
  console.log('=== MEMBERS TABLE SCHEMA ===');
  const [members] = await connection.execute('DESCRIBE members');
  members.forEach(col => {
    console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})${col.Default ? ` DEFAULT ${col.Default}` : ''}`);
  });
  
  console.log('\n=== PAYMENTS TABLE SCHEMA ===');
  const [payments] = await connection.execute('DESCRIBE payments');
  payments.forEach(col => {
    console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})${col.Default ? ` DEFAULT ${col.Default}` : ''}`);
  });
  
  console.log('\n=== ATTENDANCE TABLE SCHEMA ===');
  const [attendance] = await connection.execute('DESCRIBE attendance');
  attendance.forEach(col => {
    console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})${col.Default ? ` DEFAULT ${col.Default}` : ''}`);
  });
  
  console.log('\n=== ANNOUNCEMENTS TABLE SCHEMA ===');
  const [announcements] = await connection.execute('DESCRIBE announcements');
  announcements.forEach(col => {
    console.log(`${col.Field}: ${col.Type} (${col.Null === 'YES' ? 'NULL' : 'NOT NULL'})${col.Default ? ` DEFAULT ${col.Default}` : ''}`);
  });
  
  await connection.end();
}

checkSchema().catch(console.error);
