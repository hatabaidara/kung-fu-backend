const https = require('https');

async function alterTables() {
  console.log('🔧 Fixing database columns via API...');
  
  // Create a simple API endpoint to alter tables
  const alterSQL = `
    ALTER TABLE members 
    MODIFY COLUMN membership_type VARCHAR(100),
    MODIFY COLUMN membership_status VARCHAR(50)
  `;

  const data = JSON.stringify({ query: alterSQL });

  const options = {
    hostname: 'kung-fu-backend.onrender.com',
    port: 443,
    path: '/api/admin/alter-table',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log('Alter API Response Status:', res.statusCode);
        console.log('Alter API Response:', body);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (error) => {
      console.error('Alter API Error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

// Alternative: Create a direct SQL execution endpoint
async function createFixEndpoint() {
  console.log('📝 Creating fix endpoint...');
  
  const fixCode = `
// Add to backend/src/routes/admin.js
router.post('/alter-table', async (req, res) => {
  try {
    const { query } = req.body;
    await pool.query(query);
    res.json({ message: 'Table altered successfully' });
  } catch (error) {
    console.error('Alter table error:', error);
    res.status(500).json({ error: error.message });
  }
});
  `;
  
  console.log('Add this code to backend/src/routes/admin.js:');
  console.log(fixCode);
}

alterTables()
  .then(result => {
    console.log('Alter test completed:', result.status === 200 ? 'SUCCESS' : 'FAILED');
  })
  .then(() => createFixEndpoint())
  .catch(console.error);
