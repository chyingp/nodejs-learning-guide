var http = require('http');

//  在命令号执行此文件后，会触发两次 = =b1，一次是因为server里主动一次，另一次是因为下面client语句又去请求一次
 // 而 b3 , b4都不会触发
var server = http.createServer(function(req, res){
	// res.setTimeout(1000);
	res.setTimeout(1000, function(socket){
		console.log(typeof socket);
		console.log('= =b1')
	});
});

// server.on('timeout', function(socket){
// 	console.log(typeof socket);
// 	console.log('= =b2')
// });

server.listen(3000);

var client = http.get('http://127.0.0.1:3000', function(res){
	res.on('timeout', function(socket){
		console.log(typeof socket);
		console.log('= =b3')
	});
});

client.on('timeout', function(socket){
	console.log(typeof socket);
	console.log('= =b4')
});