const https = require('https');

async function fixColumns() {
  console.log('Testing API connection to fix columns...');
  
  const data = JSON.stringify({
    first_name: "Test",
    last_name: "User", 
    phone: "+33612345678",
    email: "test@example.com",
    date_of_birth: "1990-01-01",
    membership_type: "Boxe", // Test with longer value
    membership_status: "active",
    join_date: "2026-04-09",
    expiry_date: "2027-04-09"
  });

  const options = {
    hostname: 'kung-fu-backend.onrender.com',
    port: 443,
    path: '/api/members',
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
        console.log('API Response Status:', res.statusCode);
        console.log('API Response:', body);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (error) => {
      console.error('API Error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

fixColumns().then(result => {
  console.log('Test completed:', result.status === 201 ? 'SUCCESS' : 'FAILED');
}).catch(console.error);
