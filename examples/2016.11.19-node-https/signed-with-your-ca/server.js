var https = require('https');
var fs = require('fs');

var options = {
	key: fs.readFileSync('./cert/my-server.key.pem'),
	cert: fs.readFileSync('./cert/my-server.crt.pem')
};

var server = https.createServer(options, function(req, res){
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	res.end('CA自签名的证书');
});

server.listen(3000);