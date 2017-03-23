var net = require('net');

function toNumber(x) { return (x = Number(x)) >= 0 ? x : false; }

var server = net.createServer(function(socket){
	// socket.end('hello');
	// server.close();
});

server.listen(3002);

var server2 = net.createServer(function(socket){
	// socket.end('hello');
	// server.close();
});

server2.listen(server);

var handle = server._handle;

console.log(`handle instanceof TCP: ${handle instanceof TCP}`)
console.log(`server.handle: ${server.handle}`)
console.log(`typeof server: ${typeof server}`);
console.log(`handle.port: ${handle.port}`)
console.log(`handle.path: ${handle.path}`);
console.log(`toNumber(server): ${toNumber(server)}`);


