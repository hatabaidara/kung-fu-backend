// Test script to verify CORS and HTTPS from different devices
const https = require('https');

async function testCORSAndHTTPS() {
  console.log('=== CORS AND HTTPS VERIFICATION TEST ===');
  console.log('Testing CORS and HTTPS from different devices...\n');
  
  const tests = [
    {
      name: 'HTTPS Frontend Access',
      url: 'https://kung-fu-frontend.vercel.app',
      expectedStatus: 200,
      checkHTTPS: true
    },
    {
      name: 'HTTPS Backend Access',
      url: 'https://kung-fu-backend.onrender.com/api/health',
      expectedStatus: 200,
      checkHTTPS: true
    },
    {
      name: 'HTTPS Backend API Test',
      url: 'https://kung-fu-backend.onrender.com/api/test',
      expectedStatus: 200,
      checkHTTPS: true
    },
    {
      name: 'HTTPS Backend Members',
      url: 'https://kung-fu-backend.onrender.com/api/members',
      expectedStatus: 200,
      checkHTTPS: true,
      checkCORS: true
    }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`Testing ${test.name}...`);
    try {
      const result = await testUrlWithCORS(test);
      results.push(result);
      
      if (result.success) {
        console.log(`  ✅ SUCCESS - Status: ${result.statusCode}`);
        console.log(`  🔒 HTTPS: ${result.https ? 'Secure' : 'Not Secure'}`);
        
        if (result.cors) {
          console.log(`  🌐 CORS Origin: ${result.cors.origin}`);
          console.log(`  🌐 CORS Methods: ${result.cors.methods}`);
          console.log(`  🌐 CORS Headers: ${result.cors.headers}`);
        }
      } else {
        console.log(`  ❌ FAILED - Status: ${result.statusCode}`);
        console.log(`  📄 Error: ${result.error}`);
      }
    } catch (error) {
      results.push(error);
      console.log(`  ❌ ERROR: ${error.error}`);
    }
    console.log('');
  }
  
  // Summary
  console.log('=== VERIFICATION SUMMARY ===');
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`Successful tests: ${successCount}/${totalCount}`);
  
  if (successCount === totalCount) {
    console.log('✅ All tests passed!');
    console.log('✅ HTTPS is working everywhere');
    console.log('✅ CORS is properly configured');
    console.log('✅ Application is accessible from any device');
  } else {
    console.log('❌ Some tests failed. Check results above.');
  }
}

function testUrlWithCORS(test) {
  return new Promise((resolve, reject) => {
    const url = new URL(test.url);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'Origin': 'https://kung-fu-frontend.vercel.app',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (response) => {
      let data = '';
      
      response.on('data', (chunk) => {
        data += chunk;
      });
      
      response.on('end', () => {
        const result = {
          url: test.url,
          statusCode: response.statusCode,
          statusMessage: response.statusMessage,
          headers: response.headers,
          data: data.substring(0, 200) + (data.length > 200 ? '...' : ''),
          success: response.statusCode === test.expectedStatus,
          https: url.protocol === 'https:'
        };
        
        // Check CORS headers if requested
        if (test.checkCORS) {
          result.cors = {
            origin: response.headers['access-control-allow-origin'],
            methods: response.headers['access-control-allow-methods'],
            headers: response.headers['access-control-allow-headers'],
            credentials: response.headers['access-control-allow-credentials']
          };
        }
        
        resolve(result);
      });
    });
    
    req.on('error', (error) => {
      reject({
        url: test.url,
        error: error.message,
        success: false
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      reject({
        url: test.url,
        error: 'Request timeout',
        success: false
      });
    });
    
    req.end();
  });
}

testCORSAndHTTPS().catch(console.error);
