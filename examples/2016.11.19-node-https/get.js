var https = require('https');

https.get('https://www.baidu.com', function(res){
	res.on('data', function(data){
		process.stdout.write(data);
	});
}).on('error', function(err){
	console.error(err);
});