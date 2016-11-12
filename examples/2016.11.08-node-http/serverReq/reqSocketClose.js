var http = require('http');

var server = http.createServer(function(req, res){
    
    console.log('server: 收到客户端请求');
    
    req.on('close', function(){
        console.log('server: req close');
    });
	
	req.socket.on('close', function(){
		console.log('server: req.socket close');
	});    
    
    res.end('ok'); 
});

server.listen(3000);

var client = http.get('http://127.0.0.1:3000/aborted', function(res){
	console.log('client: 收到服务端响应');
});
