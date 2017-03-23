var net = require('net');

var server = net.createServer(function(socket){
	socket.end('hello');
	server.close();
});

server.listen('/tmp/server.sock');