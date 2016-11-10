var http = require('http');

var server = http.createServer(function(req, res){
	console.log( '客户端请求url：' + req.url );
	console.log( 'http版本：' + req.httpVersion );
	console.log( 'http请求方法：' + req.method );
	console.log( 'http headers：' + JSON.stringify(req.headers) );

	res.end('ok');
});

server.listen(3000);

