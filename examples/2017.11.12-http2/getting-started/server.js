const http2 = require('http2');
const fs = require('fs');

// 创建server
const server = http2.createSecureServer({
  key: fs.readFileSync('localhost-privkey.pem'),
  cert: fs.readFileSync('localhost-cert.pem')
});

server.on('stream', (stream, headers) => {
  stream.end('ok');
});

server.listen(3002);