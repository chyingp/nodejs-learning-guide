var dgram = require('dgram');
var socket = dgram.createSocket('udp4');

var testMessage = "[hello world] pid: " + process.pid;
var broadcastAddress = '255.255.255.255';
var broadcastPort = 5555;

//192.168.1.101
socket.bind(broadcastPort, '0.0.0.0', function(){
	socket.setBroadcast(true);
});

socket.on("message", function ( data, rinfo ) {
	console.log("Message received from ", rinfo.address, " : ", data.toString());
});

setInterval(function () {
	socket.send(new Buffer(testMessage),
		0,
		testMessage.length,
		broadcastPort,
		broadcastAddress,
		//'127.0.0.1',
		//'0.0.0.0',
		function (err) {
			if (err) console.log(err);

			console.log("Message sent");
		}
	);
}, 1000);