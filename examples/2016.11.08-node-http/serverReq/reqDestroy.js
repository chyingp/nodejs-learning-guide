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
	//  此例之所以会触发 client error 是因为 createServer里没有给 res.end()，
	// 若给了，即时req中destroy也不会触发 client error
	client.on('error', function(error){
		console.log('客户端：client error触发！' + error.message);
	});
});

// 控制台输出如下：
// 服务端：收到客户端请求
// 服务端：req socket error: 测试destroy
// 客户端：client error触发！socket hang up