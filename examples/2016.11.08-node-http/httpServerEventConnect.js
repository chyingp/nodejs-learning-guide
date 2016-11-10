var http = require('http');
var PORT = 3000;

var server = http.createServer(function(req, res){
	res.end('ok');
});

// 注意：发起connect请求的例子在 ./httpServerEventConnectClient.js 里
server.on('connect', function(req, socket, head){
	console.log('connect事件触发');
	socket.end();	// 反正我就只想举个例子，没打算正经处理。。。
});

server.listen(PORT);