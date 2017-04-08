var http = require('http');
var port = 3001;
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req, res, next){
	// POST /post HTTP/1.1
	// Content-Type: application/x-www-form-urlencoded

	// nick=chyingp&gender=man
	
	var contentType = req.headers['content-type'];  // application/x-www-form-urlencoded
	var method = req.method;
	var chunk = Buffer.alloc(0);
	
	req.on('data', function(buf){
		chunk = Buffer.concat([chunk, buf]);
	});
	req.on('end', function(){
		var obj = querystring.parse( chunk.toString() );
		res.end(obj);  // nick=chyingp&gender=man
	});
});

server.listen(port, function(){
	console.log('listening on port: %s', port);
});

/*
POST /post HTTP/1.1
Host: 127.0.0.1:3001
Content-Type: application/x-www-form-urlencoded
Cache-Control: no-cache
Postman-Token: 15e8ce06-3283-8d4f-6fdd-4e437cd26588

nick=chyingp&gender=man
 */

/*
var qs = require("querystring");
var http = require("http");

var options = {
  "method": "POST",
  "hostname": "127.0.0.1",
  "port": "3001",
  "path": "/post",
  "headers": {
    "content-type": "application/x-www-form-urlencoded",
    "cache-control": "no-cache",
    "postman-token": "98208d62-6078-80cd-add6-1a3f612d8996"
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

req.write(qs.stringify({ nick: 'chyingp', gender: 'man' }));
req.end();
 */