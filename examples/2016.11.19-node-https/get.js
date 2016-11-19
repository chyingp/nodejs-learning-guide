var https = require('https');

https.get('https://www.baidu.com', function(res){
	console.log('status code: ' + res.statusCode);
	console.log('headers: ' + res.headers);

	res.on('data', function(data){
		process.stdout.write(data);
	});
}).on('error', function(err){
	console.error(err);
});