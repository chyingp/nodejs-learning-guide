const http2 = require('http2');
const fs = require('fs');
const client = http2.connect('https://localhost:3000', {
  ca: fs.readFileSync('localhost-cert.pem')
});
client.on('socketError', (err) => console.error(err));
client.on('error', (err) => console.error(err));

const req = client.request({ ':path': '/' });

req.on('response', (headers, flags) => {
  for (const name in headers) {
    console.log(`${name}: ${headers[name]}`);
  }
});

req.setEncoding('utf8');
let data = '';
req.on('data', (chunk) => { data += chunk; });
req.on('end', () => {
  console.log(`\n${data}`);
  client.destroy();
});
req.end();