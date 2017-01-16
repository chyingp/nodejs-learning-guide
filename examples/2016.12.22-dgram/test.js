var dgram = require('dgram');
var PORT = 33333;
var HOST = '127.0.0.1';

var socket = dgram.createSocket('udp4');

var broadcastAddress = '255.255.255.255';
var broadcastPort = 5555;
var testMessage = Buffer.from('hello');

var fuckMessage = Buffer.from('fuck');

socket.bind(function(){
	socket.setBroadcast(true);	

	socket.send(fuckMessage, 0, fuckMessage.length, PORT, broadcastAddress , function (err) {
		if (err) console.log(err);
		console.log("Message sent");
		socket.close();
	});		
});

// socket.send();


// socket.on("message", function ( data, rinfo ) {
// 	console.log("Message received from ", rinfo.address, " : ", data.toString());
// });
// socket.send(testMessage, PORT, HOST, function(err, bytes) {
//     if (err) throw err;
//     console.log('UDP message sent to ' + HOST +':'+ PORT);
//     // socket.close();

//     socket.setBroadcast(true);

// 	socket.send(fuckMessage, PORT, broadcastAddress, function (err) {
// 		if (err) console.log(err);
		
// 		console.log("Message sent");
// 	});	
	    
// });

// socket.bind(function(){
// 	socket.setBroadcast(true);

// 	socket.send(fuckMessage, PORT, broadcastAddress, function (err) {
// 		if (err) console.log(err);
		
// 		console.log("Message sent");
// 	});	
// });

// setTimeout(function(){
// 	socket.setBroadcast(true);
// 	socket.send(testMessage, broadcastPort, broadcastAddress, function (err) {
// 		if (err) console.log(err);
		
// 		console.log("Message sent");
// 	});	
// }, 2000);



// //192.168.1.101
// socket.bind(broadcastPort, '0.0.0.0', function(){
// 	socket.setBroadcast(true);
// });


// setInterval(function () {
// 	socket.send(new Buffer(testMessage),
// 		0,
// 		testMessage.length,
// 		broadcastPort,
// 		broadcastAddress,
// 		//'127.0.0.1',
// 		//'0.0.0.0',
// 		function (err) {
// 			if (err) console.log(err);

// 			console.log("Message sent");
// 		}
// 	);
// }, 1000);