// Test script to verify data insertion in TiDB database
const https = require('https');

// Test data for insertion
const testMember = {
  first_name: 'Test',
  last_name: 'User',
  email: 'test.user@example.com',
  phone: '+33612345678',
  date_of_birth: '1990-01-01',
  membership_type: 'basic',
  membership_status: 'active',
  join_date: '2024-01-01',
  expiry_date: '2024-12-31'
};

const testPayment = {
  member_id: 1,
  amount: 50.00,
  payment_type: 'membership',
  payment_method: 'card',
  payment_date: '2024-04-08',
  status: 'paid',
  description: 'Test payment from verification script'
};

const testAnnouncement = {
  title: 'Test Announcement',
  content: 'This is a test announcement for data verification',
  type: 'general',
  status: 'published',
  author_id: 1
};

function postData(url, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'kung-fu-backend.onrender.com',
      port: 443,
      path: url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (response) => {
      let responseData = '';
      
      response.on('data', (chunk) => {
        responseData += chunk;
      });
      
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(responseData);
          resolve({
            statusCode: response.statusCode,
            data: jsonData,
            success: response.statusCode >= 200 && response.statusCode < 300
          });
        } catch (error) {
          resolve({
            statusCode: response.statusCode,
            data: responseData,
            success: false,
            error: 'Invalid JSON response'
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({
        success: false,
        error: error.message
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        success: false,
        error: 'Request timeout'
      });
    });
    
    req.write(postData);
    req.end();
  });
}

async function testDataInsertion() {
  console.log('=== DATA INSERTION VERIFICATION TEST ===');
  console.log('Testing data insertion from Vercel to Render backend...\n');
  
  const tests = [
    {
      name: 'Member Creation',
      url: '/api/members',
      data: testMember
    },
    {
      name: 'Payment Creation',
      url: '/api/payments',
      data: testPayment
    },
    {
      name: 'Announcement Creation',
      url: '/api/announcements',
      data: testAnnouncement
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    try {
      const result = await postData(test.url, test.data);
      results.push({
        test: test.name,
        ...result
      });
      
      if (result.success) {
        console.log(`  ✅ SUCCESS - Status: ${result.statusCode}`);
        if (result.data.id) {
          console.log(`  📝 Created with ID: ${result.data.id}`);
        }
        if (result.data.message) {
          console.log(`  💬 Message: ${result.data.message}`);
        }
      } else {
        console.log(`  ❌ FAILED - Status: ${result.statusCode}`);
        console.log(`  📄 Response: ${JSON.stringify(result.data, null, 2)}`);
      }
    } catch (error) {
      results.push({
        test: test.name,
        success: false,
        error: error.error
      });
      console.log(`  ❌ ERROR: ${error.error}`);
    }
    console.log('');
  }
  
  // Summary
  console.log('=== INSERTION TEST SUMMARY ===');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`Successful insertions: ${successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('✅ All data insertion tests passed!');
    console.log('Backend is correctly receiving and inserting data into TiDB.');
  } else {
    console.log('❌ Some insertion tests failed.');
    console.log('Check the results above for details.');
  }
  
  // Verify data persistence by fetching
  console.log('\n=== DATA PERSISTENCE VERIFICATION ===');
  try {
    const fetchResult = await postData('/api/members', {});
    if (fetchResult.success) {
      const members = fetchResult.data;
      const testMemberExists = members.some(m => 
        m.email === testMember.email && 
        m.first_name === testMember.first_name
      );
      
      if (testMemberExists) {
        console.log('✅ Test data successfully persisted in database!');
      } else {
        console.log('❌ Test data not found in database after insertion.');
      }
    }
  } catch (error) {
    console.log(`❌ Failed to verify data persistence: ${error.error}`);
  }
}

testDataInsertion().catch(console.error);
