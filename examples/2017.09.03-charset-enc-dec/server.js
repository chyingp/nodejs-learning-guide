var http = require('http');
var iconv = require('iconv-lite');

var server = http.createServer(function (req, res) {
	var chunks = [];
	
	req.on('data', function (chunk) {
		chunks.push(chunk)
	});

	req.on('end', function () {
		chunks = Buffer.concat(chunks);

		// 对二进制进行解码
		var body = iconv.decode(chunks, 'gbk');
		console.log(body);

		res.end('HELLO FROM SERVER');
	});

});

server.listen(3000);