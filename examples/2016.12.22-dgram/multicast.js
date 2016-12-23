var dgram = require('dgram');
var socket = dgram.createSocket('udp4');

var testMessage = "[hello world] pid: " + process.pid;
var multicastAddress = '239.1.2.3';
var multicastPort = 5555;

socket.bind(multicastPort, '0.0.0.0', function(){
	socket.addMembership(multicastAddress);
});

socket.on("message", function ( data, rinfo ) {
	console.log("Message received from ", rinfo.address, " : ", data.toString());
});

setInterval(function () {
	socket.send(new Buffer(testMessage),
		0,
		testMessage.length,
		multicastPort,
		multicastAddress,
		function (err) {
			if (err) console.log(err);

			console.log("Message sent");
		}
	);
}, 1000);