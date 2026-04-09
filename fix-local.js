const { pool } = require('./src/config/database-tidb-render');

async function fixLocal() {
  console.log('× Fixing columns using local backend connection...');
  
  try {
    // Test connection first
    const connection = await pool.getConnection();
    console.log('× Successfully connected to TiDB database');
    
    // Check current columns
    const [cols] = await connection.query('DESCRIBE members');
    console.log('Current columns:', cols.map(c => `${c.Field}: ${c.Type}`));
    
    // Execute ALTER TABLE queries
    console.log('× Altering membership_type column...');
    await connection.query('ALTER TABLE members MODIFY COLUMN membership_type VARCHAR(100)');
    console.log('× Fixed membership_type column to VARCHAR(100)');
    
    console.log('× Altering membership_status column...');
    await connection.query('ALTER TABLE members MODIFY COLUMN membership_status VARCHAR(50)');
    console.log('× Fixed membership_status column to VARCHAR(50)');
    
    console.log('× All columns fixed successfully!');
    connection.release();
    
    // Test with Render API
    console.log('× Testing with Render API...');
    testWithRender();
    
  } catch (error) {
    console.error('× Error fixing columns:', error.message);
    console.error('× Full error:', error);
  }
}

function testWithRender() {
  const https = require('https');
  
  const testData = JSON.stringify({
    first_name: "Jean",
    last_name: "Dupont",
    phone: "+33612345678",
    email: "jean.dupont@example.com",
    date_of_birth: "1999-01-15",
    membership_type: "Boxe", // Should work now
    membership_status: "active",
    join_date: "2024-01-15",
    expiry_date: "2024-12-31"
  });

  const testOptions = {
    hostname: 'kung-fu-backend.onrender.com',
    port: 443,
    path: '/api/members',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(testData)
    }
  };

  const testReq = https.request(testOptions, (testRes) => {
    let testBody = '';
    testRes.on('data', (chunk) => {
      testBody += chunk;
    });
    testRes.on('end', () => {
      console.log('Render API Test Status:', testRes.statusCode);
      console.log('Render API Test Response:', testBody);
      
      if (testRes.statusCode === 201) {
        console.log('× SUCCESS! Member creation now works on Render!');
        console.log('× All CRUD tests should now pass!');
      } else if (testRes.statusCode === 500 && testBody.includes('Data truncated')) {
        console.log('× Still getting truncation error - columns not fixed on Render');
        console.log('× Need to wait for Render deployment or fix directly on Render');
      } else {
        console.log('× Unexpected error:', testBody);
      }
    });
  });

  testReq.on('error', (error) => {
    console.error('Render API Test Error:', error.message);
  });

  testReq.write(testData);
  testReq.end();
}

fixLocal().catch(console.error);
