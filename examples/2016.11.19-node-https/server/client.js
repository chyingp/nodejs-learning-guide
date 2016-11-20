var https = require('https');
var fs = require('fs');
var cert = fs.readFileSync('./cert/chyingp-cert.pem');

var options = {
	hostname: 'www.chyingp.com',
	port: '3000',
	path: '/',
	// ca: [cert]
	// rejectUnauthorized: false
};

var req = https.request(options, function(res){
	res.pipe(process.stdout);
});
req.on('error', function(error){
	console.log(error.code);
});
req.end();
