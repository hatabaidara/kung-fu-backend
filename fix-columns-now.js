const https = require('https');

async function fixColumnsNow() {
  console.log('🔧 Fixing database columns via new admin API...');
  
  const data = JSON.stringify({
    query: `
      ALTER TABLE members 
      MODIFY COLUMN membership_type VARCHAR(100),
      MODIFY COLUMN membership_status VARCHAR(50)
    `
  });

  const options = {
    hostname: 'kung-fu-backend.onrender.com',
    port: 443,
    path: '/api/admin/fix-members-columns',
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
        console.log('Fix API Response Status:', res.statusCode);
        console.log('Fix API Response:', body);
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (error) => {
      console.error('Fix API Error:', error.message);
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

fixColumnsNow()
  .then(result => {
    if (result.status === 200) {
      console.log('✅ Columns fixed successfully!');
      console.log('🔄 Now testing member creation...');
      
      // Test member creation after fix
      const testData = JSON.stringify({
        first_name: "Jean",
        last_name: "Dupont",
        phone: "+33612345678",
        email: "jean.dupont@example.com",
        date_of_birth: "1999-01-15",
        membership_type: "Boxe", // Should work now with VARCHAR(100)
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
          console.log('Test Member Creation Status:', testRes.statusCode);
          console.log('Test Member Creation Response:', testBody);
          
          if (testRes.statusCode === 201) {
            console.log('🎉 SUCCESS! Member creation now works!');
          } else {
            console.log('❌ FAILED! Member creation still has issues.');
          }
        });
      });

      testReq.on('error', (error) => {
        console.error('Test Member Creation Error:', error.message);
      });

      testReq.write(testData);
      testReq.end();
      
    } else {
      console.log('❌ FAILED to fix columns');
    }
  })
  .catch(console.error);
