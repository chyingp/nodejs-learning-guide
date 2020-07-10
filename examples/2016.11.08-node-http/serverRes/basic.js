var http = require('http');

// 1, 这里如果 res.send("xxx")会报错 ： res.send is not a function ， 为什么呢？？？
// 2, 想要设置200/ok，可以 res.writeHead(200, 'ok'); 
//  也可以 res.statusCode = 200; res.statusMessage = 'ok';
// 3, 已经通过 res.setHeader() 设置了header，
// 当通过 res.writeHead() 设置同名header，res.writeHead() 的设置会覆盖之前的设置。
//  但 writeHeader之后就不能再用setHeader, 否则报错 Error: Can't set headers after they are sent.。
// 4，响应头部操作
// // 增
// res.setHeader('Content-Type', 'text/plain');
// // 删
// res.removeHeader('Content-Type');
// // 改
// res.setHeader('Content-Type', 'text/plain');
// res.setHeader('Content-Type', 'text/html');  // 覆盖
// // 查
// res.getHeader('content-type');
// 其中略显不同的是 res.getHeader(name)，name 用的是小写，但返回值没做特殊处理。
var server = http.createServer(function(req, res){
	// res.setHeader('Content-Type', 'text/html');
	res.writeHead(200, 'ok', {
		'Content-Type': 'text/html; charset=utf-8',
		// 'X-Content-Type-Options': 'nosniff'
		// 'Connection': 'Transfer-Encoding',
		// 'Transfer-Encoding': 'chunked'
	});
	
	res.write('hello');
	// res.setTimeout(2000);
	// res.write('world');

	setTimeout(function(){
		res.write('world');
		res.end();
	}, 2000)
	// res.end();
	// res.send("ok")

});

server.listen(3000);