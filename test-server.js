const http = require('http');

// Test if server is running
const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/comments/test',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response:', data);
    if (res.statusCode === 200) {
      console.log('✅ Server is running and comments API is accessible');
    } else {
      console.log('❌ Server responded with error');
    }
  });
});

req.on('error', (err) => {
  console.error('❌ Error connecting to server:', err.message);
  console.log('Make sure the server is running with: npm start');
});

req.end();
