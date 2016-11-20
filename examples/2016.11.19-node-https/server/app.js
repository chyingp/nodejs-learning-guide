var https = require('https');
var fs = require('fs');

var options = {
	key: fs.readFileSync('./cert/chyingp-key.pem'),
	cert: fs.readFileSync('./cert/chyingp-cert.pem')
};

var server = https.createServer(options, function(req, res){
	console.log('request');
	res.end('hello');
});

server.listen(3000);

// openssl x509 -req -in chyingp-csr.pem -signkey chyingp-key.pem -out chyingp-cert.pem