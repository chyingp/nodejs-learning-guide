var http = require('http');

var server = http.createServer(function(req, res){
	res.setHeader('Content-Type', 'TEXT/HTML');
	console.log( res.getHeader('content-type') );

	res.setHeader('Content-Type', 'text/plain');
	console.log( res.getHeader('content-type') );

	res.writeHead(200, 'ok', {
		'Content-Type': 'TEXT/PLAIN'
	});
	res.end('hello');
});

server.listen(3000);