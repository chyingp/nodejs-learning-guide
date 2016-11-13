var http = require('http');

var server = http.createServer(function(req, res){
	res.setTimeout(1000);
	// res.setTimeout(1000, function(socket){
	// 	console.log(typeof socket);
	// 	console.log('= =b')
	// });
});

// server.on('timeout', function(socket){
// 	// console.log(typeof socket);
// 	// console.log('= =b')
// });

server.listen(3000);

var client = http.get('http://127.0.0.1:3000', function(res){
	res.on('timeout', function(socket){
		console.log(typeof socket);
		console.log('= =b')
	});
});

client.on('timeout', function(socket){
	console.log(typeof socket);
	console.log('= =b')
});