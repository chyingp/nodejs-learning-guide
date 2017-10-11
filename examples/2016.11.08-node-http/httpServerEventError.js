var http = require('http');
var PORT = 3000;
var noop = function(){};

// 这个例子是在监测服务端口占用问题
var svr = http.createServer(noop);
var anotherSvr = http.createServer(noop);

anotherSvr.on('error', function(e){
	console.error('出错啦！' + e.message);
});

svr.listen(PORT, function(){
	anotherSvr.listen(PORT);
});