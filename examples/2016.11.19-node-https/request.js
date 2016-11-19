var https = require('https');

var options = {
	method: 'GET',
	hostname: 'www.baidu.com',
	port: '443',  // 默认是443
	path: '/'
};

var req = https.request(options, function(res){
	console.log('status code: ' + res.statusCode);
	console.log('headers: ' + res.headers);

	res.on('data', function(data){
		process.stdout.write(data);
	});
});

req.end();

req.on('error', function(e){
	console.error(e);
});