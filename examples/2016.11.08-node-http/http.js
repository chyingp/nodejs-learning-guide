var http = require('http');

var server = http.createServer(function(serverReq, serverRes){
	serverRes.end('hello');
});
// 会在本地3000端口输出hello
server.listen(3000);

// 有下面这个才会在vim命令执行后紧接着输出上面的 hello 返回语句
var client = http.get('http://127.0.0.1:3000', function(clientRes){
	clientRes.pipe(process.stdout);
});