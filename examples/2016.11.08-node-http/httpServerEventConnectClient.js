var qs = require("querystring");
var http = require("http");

var options = {
  "method": "CONNECT",
  "hostname": "127.0.0.1",
  "port": "3000",
  "path": "/",
  "headers": {
    "content-type": "application/x-www-form-urlencoded",
    "cache-control": "no-cache",
    "postman-token": "03c2e7cf-4921-8f4b-d0c8-c30594d2d4da"
  }
};

var req = http.request(options, function (res) {
  var chunks = [];

  res.on("data", function (chunk) {
    chunks.push(chunk);
  });

  res.on("end", function () {
    var body = Buffer.concat(chunks);
    console.log(body.toString());
  });
});

req.write(qs.stringify({ nick: 'casper', hello: 'world' }));
req.end();