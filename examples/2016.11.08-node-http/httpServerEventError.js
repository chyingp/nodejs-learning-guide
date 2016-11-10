var http = require('http');
var PORT = 3000;
var noop = function(){};

var svr = http.createServer(noop);
var anotherSvr = http.createServer(noop);

anotherSvr.on('error', function(e){
	console.error('出错啦！' + e.message);
});

svr.listen(PORT, function(){
	anotherSvr.listen(PORT);
});