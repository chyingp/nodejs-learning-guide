var http = require('http');
var port = 3001;
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req, res, next){
	
	var content = req.headers['content-type'];  // application/json
	var method = req.method;
	var chunk = Buffer.alloc(0);
	
	req.on('data', function(buf){
		chunk = Buffer.concat([chunk, buf]);
	});

	req.on('end', function(){
		var str = chunk.toString();
		var obj = JSON.parse( str );  // {nick: 'chyingp', gender: 'man'}		
		res.end(str);
	});
});

server.listen(port, function(){
	console.log('listening on port: %s', port);
});

/*
var http = require("http");

var options = {
  "method": "POST",
  "hostname": "127.0.0.1",
  "port": "3001",
  "path": "/post",
  "headers": {
    "content-type": "application/json",
    "cache-control": "no-cache",
    "postman-token": "40d0d6e7-d1b4-55d5-80e8-a244942bacb8"
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

req.write(JSON.stringify({ nick: 'chyingp', gender: 'man' }));
req.end();
 */