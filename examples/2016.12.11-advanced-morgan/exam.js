var http = require('http');

http.createServer(function(req, res){
	var content = '';
	req.on('data', function(chunk){
		content += chunk;
	});
	req.on('end', function(){
		console.log('body: ' + content);
		res.end('hello');
	});
}).listen(3000);