var http = require('http');
var port = 3001;
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req, res, next){

	// POST /post HTTP/1.1	
	// Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW	

	// ------WebKitFormBoundary7MA4YWxkTrZu0gW
	// Content-Disposition: form-data; name="nick"

	// chyingp
	// ------WebKitFormBoundary7MA4YWxkTrZu0gW
	// Content-Disposition: form-data; name="gender"

	// man
	// ------WebKitFormBoundary7MA4YWxkTrZu0gW--	
	
	var contentType = req.headers['content-type'];  // multipart/form-data
	var boundary = contentType.split('; ')[1].split('=')[1];  // ----WebKitFormBoundary7MA4YWxkTrZu0gW
	var method = req.method;  // POST
	var chunk = Buffer.alloc(0);
	
	req.on('data', function(buf){
		chunk = Buffer.concat([chunk, buf]);
	});

	req.on('end', function(){
		var str = chunk.toString();		
		var arr = str.split(boundary);
		var reg = /Content-Disposition:\sform-data;\sname="(\w+)"[\n\r]+(\w+)/g;
		var obj = {}, key, value;
		
		while(result = reg.exec(str)){
			key = result[1];
			value = result[2];
			obj[key] = value;
		}
		res.end(JSON.stringify(obj));
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
    "content-type": "multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW",
    "cache-control": "no-cache",
    "postman-token": "602b6eb7-9809-47ea-0c87-67306f8730ea"
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

req.write("------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"nick\"\r\n\r\nchyingp\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name=\"gender\"\r\n\r\nman\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--");
req.end();
 */

/*
POST /post HTTP/1.1
Host: 127.0.0.1:3001
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
Cache-Control: no-cache
Postman-Token: efdb09be-52f4-d944-acc9-85d4e6027938

------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="nick"

chyingp
------WebKitFormBoundary7MA4YWxkTrZu0gW
Content-Disposition: form-data; name="gender"

man
------WebKitFormBoundary7MA4YWxkTrZu0gW--
 */