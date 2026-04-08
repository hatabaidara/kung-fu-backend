const http = require('http');

// Test the API endpoint
const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/test',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const jsonData = JSON.parse(data);
      console.log('\n=== API RESPONSE ===');
      console.log(JSON.stringify(jsonData, null, 2));
      console.log('=== END RESPONSE ===');
    } catch (error) {
      console.log('Raw Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request Error:', error.message);
});

req.end();
