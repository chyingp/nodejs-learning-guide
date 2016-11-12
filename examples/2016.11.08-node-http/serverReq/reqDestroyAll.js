var http = require('http');

var server = http.createServer(function(req, res){
	
	console.log('服务端：收到客户端请求');

	res.flushHeaders();
	
	// req.destroy(new Error('= =|||'));
	
	req.on('error', function(error){
		console.log('服务端：req error: ' + error.message);
	});
	
	req.socket.on('error', function(error){
		console.log('服务端：req socket error: ' + error.message);
	})
});


server.on('error', function(error){
	console.log('server error: ' + error.message);
});

server.listen(3000, function(){

	var client = http.get('http://127.0.0.1:3000/aborted', function(res){

		console.log('客户端：收到服务端响应');
		
		// res.pipe(process.stdout);
		res.destroy(new Error('fuck'))

		res.on('error', function(){
			console.log('客户端：req error触发！');
		});
	});

	client.on('error', function(error){
		console.log('客户端：client error触发！' + error.message);
	});

	setTimeout(function(){
		// client.abort()
	}, 300)
});