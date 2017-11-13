const http = require('http');
const server = http.createServer(function (req, res) {
  res.end('ok');
});
server.listen(3001);