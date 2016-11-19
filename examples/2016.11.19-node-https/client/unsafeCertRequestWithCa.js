// 例子：指定根证书
var https = require('https');
var fs = require('fs');
var ca = fs.readFileSync('./srca.cer');

var options = {	
	hostname: 'kyfw.12306.cn',
	path: '/otn/leftTicket/init',
	ca: ca,
	// rejectUnauthorized: false,
	// requestCert: true
};

options.agent = new https.Agent(options);

// https://kyfw.12306.cn/otn/leftTicket/init

var req = https.request(options, function(res){
	res.pipe(process.stdout);
});

req.on('error', function(err){
	console.error(err);
});

req.end();