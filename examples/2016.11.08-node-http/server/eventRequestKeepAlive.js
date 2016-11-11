// 例子：在有 keep-alive 的情况下，request、connection 的关系
var http = require('http');
var PORT = 3000;
var requestIndex = 0;
var connectionIndex = 0;

var server = http.createServer(function(req, res){
	console.log('keep-alive: ' + res.shouldKeepAlive);
	res.end('ok');
});

server.on('request', function(req, res){
	requestIndex++;
	console.log('request event: 第'+ requestIndex +'个请求！');
});

server.on('connection', function(socket){
	// socket.setKeepAlive(false);  // 3000毫秒内的请求，都复用一个连接
	connectionIndex++;
	console.log('connection event: 第'+ connectionIndex +'个请求！');
});

server.listen(PORT);


// ======= 分割线 ========
// 客户端相关代码
var visit = function(){
	var keepAliveAgent = new http.Agent({ 
		keepAlive: true,
		keepAliveMsecs: 3000,
		// maxSockets: 1
	});
	var options = {
		method: 'GET',
		hostname: '127.0.0.1',
		port: PORT,
		path: '/',
		agent: keepAliveAgent
	};
	var req = http.request(options, function(){
		console.log('back');
	});
	req.on('error', function(error){
		console.log(error);
	});
	// setTimeout(function(){
	// 	http.request(options);
	// }, 500);
};

var runClientRequest = function(){
	var times = 3;
	for(var i = 0; i < 3; i ++){
		visit();
	}

	setTimeout(function(){
		visit();
	}, 4000);
};

runClientRequest();