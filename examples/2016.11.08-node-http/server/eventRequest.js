var http = require('http');
var PORT = 3000;
var requestIndex = 0;
var connectionIndex = 0;

var server = http.createServer(function(req, res){
	res.end('ok');
});

server.on('request', function(req, res){
	requestIndex++;
	console.log('request event: 第'+ requestIndex +'个请求！');
});

server.on('connection', function(req, res){
	connectionIndex++;
	console.log('connection event: 第'+ connectionIndex +'个请求！');
});

server.listen(PORT);