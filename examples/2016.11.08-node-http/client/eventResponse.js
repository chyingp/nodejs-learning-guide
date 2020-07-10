var http = require('http');

// var url = 'http://id.qq.com/';
var url = 'http://127.0.0.1:3000';

var server = http.createServer(function(req, res) {
	var url = req.url;
	res.writeHead(200, {
		'Content-Type': 'text/html;charset=utf-8'
	})
	res.end("您要访问的地址是"+url);
})
server.listen(3000);
var client = http.get(url, function(res){
	res.pipe(process.stdout);
    console.log('1. response event');
});

client.on('response', function(res){
    console.log('2. response event');
});

client.end();