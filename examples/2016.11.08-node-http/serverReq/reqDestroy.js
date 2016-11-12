var http = require('http');

var server = http.createServer(function(req, res){
	
	console.log('服务端：收到客户端请求');
	
	req.destroy(new Error('测试destroy'));
	
	req.on('error', function(error){
		console.log('服务端：req error: ' + error.message);
	});
	
	req.socket.on('error', function(error){
		console.log('服务端：req socket error: ' + error.message);
	})
});

server.on('error', function(error){
	console.log('服务端：server error: ' + error.message);
});

server.listen(3000, function(){

	var client = http.get('http://127.0.0.1:3000/aborted', function(res){
		// do nothing
	});

	client.on('error', function(error){
		console.log('客户端：client error触发！' + error.message);
	});
});