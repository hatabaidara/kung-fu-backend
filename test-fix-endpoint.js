const https = require('https');

async function testFixEndpoint() {
  console.log('× Testing new fix endpoint...');
  
  const data = JSON.stringify({});

  const options = {
    hostname: 'kung-fu-backend.onrender.com',
    port: 443,
    path: '/api/fix-columns',
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
        console.log('Fix Endpoint Status:', res.statusCode);
        console.log('Fix Endpoint Response:', body);
        
        if (res.statusCode === 200) {
          console.log('× SUCCESS! Columns fixed!');
          testMemberCreation();
        } else {
          console.log('× FAILED! Deploying new version...');
          deployNewVersion();
        }
        
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (error) => {
      console.error('Fix Endpoint Error:', error.message);
      deployNewVersion();
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

function testMemberCreation() {
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
      console.log('Test Member Creation Status:', testRes.statusCode);
      console.log('Test Member Creation Response:', testBody);
      
      if (testRes.statusCode === 201) {
        console.log('× SUCCESS! Member creation now works!');
        console.log('× All CRUD tests should now pass!');
      } else {
        console.log('× FAILED! Member creation still has issues.');
      }
    });
  });

  testReq.on('error', (error) => {
    console.error('Test Member Creation Error:', error.message);
  });

  testReq.write(testData);
  testReq.end();
}

function deployNewVersion() {
  console.log('× Deploying new version with fix endpoint...');
  console.log('× Run: git add . && git commit -m "feat: add fix-columns endpoint" && git push');
  console.log('× Then wait for Render deployment and try again');
}

testFixEndpoint().catch(console.error);
