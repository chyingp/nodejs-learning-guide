var net = require('net');

var client = net.connect(3001, function(){
	console.log('connected to server');
});

client.on('data', function(data){
	console.log(`data is ${data.toString()}`);
	client.end();
});