var net = require('net');

var client = net.connect('/tmp/server.sock', function(){
	console.log('connected to server');
});

client.on('data', function(data){
	console.log(`data is ${data.toString()}`);
	client.end();
});