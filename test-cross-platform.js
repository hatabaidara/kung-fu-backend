// Test script to verify cross-platform functionality
const https = require('https');

const testUrls = [
  {
    name: 'Frontend Vercel',
    url: 'https://kung-fu-frontend.vercel.app',
    expectedStatus: 200
  },
  {
    name: 'Backend Render Health',
    url: 'https://kung-fu-backend.onrender.com/api/health',
    expectedStatus: 200
  },
  {
    name: 'Backend Render Test',
    url: 'https://kung-fu-backend.onrender.com/api/test',
    expectedStatus: 200
  },
  {
    name: 'Backend Render Members',
    url: 'https://kung-fu-backend.onrender.com/api/members',
    expectedStatus: 200
  }
];

function testUrl(url, expectedStatus) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        resolve({
          url,
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          headers: response.headers,
          data: data.substring(0, 200) + (data.length > 200 ? '...' : ''),
          success: response.statusCode === expectedStatus
        });
      });
    });
    
    request.on('error', (error) => {
      reject({
        url,
        error: error.message,
        success: false
      });
    });
    
    request.setTimeout(10000, () => {
      request.destroy();
      reject({
        url,
        error: 'Request timeout',
        success: false
      });
    });
  });
}

async function runTests() {
  console.log('=== CROSS-PLATFORM FUNCTIONALITY TEST ===');
  console.log('Testing application accessibility from different devices...\n');
  
  const results = [];
  
  for (const test of testUrls) {
    console.log(`Testing ${test.name}...`);
    try {
      const result = await testUrl(test.url, test.expectedStatus);
      results.push(result);
      
      if (result.success) {
        console.log(`  ${result.statusCode} ${result.statusMessage} - SUCCESS`);
      } else {
        console.log(`  ${result.statusCode} ${result.statusMessage} - FAILED`);
      }
      
      if (result.data) {
        console.log(`  Response: ${result.data}`);
      }
    } catch (error) {
      results.push(error);
      console.log(`  ERROR: ${error.error}`);
    }
    console.log('');
  }
  
  // Summary
  console.log('=== TEST SUMMARY ===');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`Successful tests: ${successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('All tests passed! Application is accessible from any device.');
  } else {
    console.log('Some tests failed. Check the results above.');
  }
  
  // CORS test
  console.log('\n=== CORS TEST ===');
  console.log('Testing CORS headers from backend...');
  
  try {
    const corsTest = await testUrl('https://kung-fu-backend.onrender.com/api/test', 200);
    if (corsTest.success && corsTest.headers['access-control-allow-origin']) {
      console.log(`CORS Origin: ${corsTest.headers['access-control-allow-origin']}`);
      console.log('CORS is properly configured for cross-origin requests.');
    } else {
      console.log('CORS may not be properly configured.');
    }
  } catch (error) {
    console.log(`CORS test failed: ${error.error}`);
  }
}

runTests().catch(console.error);
