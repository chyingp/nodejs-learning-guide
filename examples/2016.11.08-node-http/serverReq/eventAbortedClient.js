var http = require('http');

// 客户端表现
// abort请求时，res.pipe(process.stdout) 这行代码是否添加，会影响close是否触发。
// 没有res.pipe(process.stdout)：close不触发。
// 有res.pipe(process.stdout)：close触发。
var server = http.createServer(function(req, res){
	
	console.log('1、服务端：收到客户端请求');
	
	res.flushHeaders();
	res.setTimeout(100);	// 故意不返回，3000ms后超时
});


server.on('error', function(){});

server.listen(3000, function(){

	var client = http.get('http://127.0.0.1:3000/aborted', function(res){

		console.log('2、客户端：收到服务端响应');
		// 	注意这行代码是否添加，会影响close是否触发。
		res.pipe(process.stdout);
		
		res.on('aborted', function(){
			console.log('3、客户端：aborted触发！');
		});

		res.on('close', function(){
			console.log('4、客户端：close触发！');
		});		
	});
});

// 输出如下
// 1、服务端：收到客户端请求
// 2、客户端：收到服务端响应
// 3、客户端：aborted触发！
// 4、客户端：close触发！