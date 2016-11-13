var http = require('http');

var server = http.createServer(function(req, res){
	res.setHeader('Content-Type', 'text/html');
	res.writeHead(200, 'ok', {
		'Content-Type': 'text/plain'
	});
	res.end('hello');
});

server.listen(3000);