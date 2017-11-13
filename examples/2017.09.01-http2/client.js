const http2 = require('http2');

const client = http2.connect('http://localhost:80');

const req = client.request({ ':path': '/' });

req.on('response', (headers) => {
  console.log(headers[':status']);
  console.log(headers['date']);
});

let data = '';
req.setEncoding('utf8');
req.on('data', (d) => data += d);
req.on('end', () => client.destroy());
req.end();