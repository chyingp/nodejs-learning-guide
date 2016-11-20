// 例子：忽略安全警告
var https = require('https');
var fs = require('fs');

var options = {	
	hostname: 'kyfw.12306.cn',
	path: '/otn/leftTicket/init',
	rejectUnauthorized: false
};

// options.agent = new https.Agent(options);

var req = https.get(options, function(res){	
	res.pipe(process.stdout);	
});

req.on('error', function(err){
	console.error(err.code);
});