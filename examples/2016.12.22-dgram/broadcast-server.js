var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var port = 33333;

server.on('message', function(message, rinfo){
	console.log('server got message from: ' + rinfo.address + ':' + rinfo.port);
});

server.bind(port);