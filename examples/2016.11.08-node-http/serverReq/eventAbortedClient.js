var http = require('http');

var server = http.createServer(function(req, res){
	
	console.log('1、服务端：收到客户端请求');
	
	res.flushHeaders();
	res.setTimeout(100);	// 故意不返回，3000ms后超时
});


server.on('error', function(){});

server.listen(3000, function(){

	var client = http.get('http://127.0.0.1:3000/aborted', function(res){

		console.log('2、客户端：收到服务端响应');

		// res.pipe(process.stdout); 注意这行代码
		
		res.on('aborted', function(){
			console.log('3、客户端：aborted触发！');
		});

		res.on('close', function(){
			console.log('4、客户端：close触发！');
		});		
	});
});

// 输出如下
// 1、收到客户端请求: /aborted
// 2、客户端请求aborted
// 3、客户端请求close