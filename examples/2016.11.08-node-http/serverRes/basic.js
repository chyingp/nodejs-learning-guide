var http = require('http');

var server = http.createServer(function(req, res){

	res.writeHead(200, 'ok', {
		'Content-Type': 'text/plain; charset=utf-8',
		// 'X-Content-Type-Options': 'nosniff'
		// 'Connection': 'Transfer-Encoding',
		// 'Transfer-Encoding': 'chunked'
	});
	res.write('hello');
	// res.setTimeout(2000);
	// res.write('world');

	setTimeout(function(){
		res.end()
	}, 2000)
	// res.end();
});

server.listen(3000);