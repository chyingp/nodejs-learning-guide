var http = require('http');
var url = require('url');
var querystring = require('querystring');

// 访问http://localhost:3000/页面上有 ok , 命令行上 post body is: , 
// 也就是说访问页面是get请求，只会触发 end 不会触发 data
//  通过curl构造post请求：curl -d 'nick=casper&hello=world' http://127.0.0.1:3000
//  此时命令行上又打印出一行  post body is: nick=casper&hello=world
var server = http.createServer(function(req, res){
	
	var body = '';
	// 实时监控的，每次只要发起post请求就会触发 data -> end
	req.on('data', function(thunk){
		body += thunk;
	});

	req.on('end', function(){
		console.log( 'post body is: ' + body );
		res.end('ok');
	});	
});

server.listen(3000);