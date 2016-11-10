// 例子：在有 keep-alive 的情况下，request、connection 的关系
var http = require('http');
var PORT = 3000;
var requestIndex = 0;
var connectionIndex = 0;

var server = http.createServer(function(req, res){
	res.end('ok');
});

server.on('request', function(req, res){
	requestIndex++;
	console.log('request event: 第'+ requestIndex +'个请求！');
});

server.on('connection', function(socket){
	// socket.setKeepAlive(true, 3000);  // 3000毫秒内的请求，都复用一个连接
	connectionIndex++;
	console.log('connection event: 第'+ connectionIndex +'个请求！');
});

server.listen(PORT);


// ======= 分割线 ========
// 客户端相关代码
var visit = function(){
	// var keepAliveAgent = new http.Agent({ 
	// 	keepAlive: true,
	// 	keepAliveMsecs: 3000
	// });
	// var options = {
	// 	hostname: '127.0.0.1',
	// 	port: PORT,
	// 	agent: keepAliveAgent
	// };
	// http.get(options);

	var options = {
	  "method": "GET",
	  "hostname": "127.0.0.1",
	  "port": "3000",
	  "path": "/",
	  "headers": {
	    "connection": "keep-alive",
	    "cache-control": "no-cache",
    	"postman-token": "191a4ed3-1c74-45be-5c37-932f837fd7be"
	  }
	};

	setTimeout(function(){
		var req = http.request(options, function (res) {
		  // var chunks = [];

		  // res.on("data", function (chunk) {
		  //   chunks.push(chunk);
		  // });

		  // res.on("end", function () {
		  //   var body = Buffer.concat(chunks);
		  //   console.log(body.toString());
		  // });		
		});

		req.end();	
	}, 500);
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

// runClientRequest();