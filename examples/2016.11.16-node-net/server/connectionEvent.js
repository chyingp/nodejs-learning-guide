var net = require('net');
var PORT = 3000;
var HOST = '127.0.0.1';
var noop = function(){};

// tcp服务端
var server = net.createServer(function(socket){
	socket.write('1. connection 触发\n');
});

server.on('connection', function(socket){
	socket.end('2. connection 触发\n');
});

server.listen(PORT, HOST);