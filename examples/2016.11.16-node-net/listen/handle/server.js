var net = require('net');

var server = net.createServer(function(socket){
	console.log('server gets connection');
	// socket.end('hello');
	// server.close();
});

server.on('listening', function(){
	console.log('server listening');
});

server.listen(3001);

var server2 = net.createServer(function(socket){
	console.log('server2 gets connection');
});

server2.listen(server);

server2.on('listening', function(){
	console.log('server2 listening');
});