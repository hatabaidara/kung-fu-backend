const https = require('https');

async function fixViaAPI() {
  console.log('× Fixing columns via existing working backend connection...');
  
  // Use the existing working connection to execute ALTER TABLE
  const fixData = JSON.stringify({
    action: 'alter_members_table',
    queries: [
      'ALTER TABLE members MODIFY COLUMN membership_type VARCHAR(100)',
      'ALTER TABLE members MODIFY COLUMN membership_status VARCHAR(50)'
    ]
  });

  const options = {
    hostname: 'kung-fu-backend.onrender.com',
    port: 443,
    path: '/api/admin/fix-members-columns',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(fixData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        console.log('Fix API Status:', res.statusCode);
        console.log('Fix API Response:', body);
        
        if (res.statusCode === 200) {
          console.log('× Columns fixed successfully! Testing member creation...');
          testMemberCreation();
        } else {
          console.log('× Fix failed, trying alternative approach...');
          fixAlternative();
        }
        
        resolve({ status: res.statusCode, body });
      });
    });

    req.on('error', (error) => {
      console.error('Fix API Error:', error.message);
      fixAlternative();
      reject(error);
    });

    req.write(fixData);
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

function fixAlternative() {
  console.log('× Trying alternative: Direct SQL via existing connection...');
  
  // Create a temporary endpoint in the existing backend
  const altData = JSON.stringify({
    query: 'ALTER TABLE members MODIFY COLUMN membership_type VARCHAR(100)'
  });

  const altOptions = {
    hostname: 'kung-fu-backend.onrender.com',
    port: 443,
    path: '/api/admin/alter-table',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(altData)
    }
  };

  const altReq = https.request(altOptions, (altRes) => {
    let altBody = '';
    altRes.on('data', (chunk) => {
      altBody += chunk;
    });
    altRes.on('end', () => {
      console.log('Alt Fix Status:', altRes.statusCode);
      console.log('Alt Fix Response:', altBody);
    });
  });

  altReq.on('error', (error) => {
    console.error('Alt Fix Error:', error.message);
  });

  altReq.write(altData);
  altReq.end();
}

fixViaAPI().catch(console.error);
