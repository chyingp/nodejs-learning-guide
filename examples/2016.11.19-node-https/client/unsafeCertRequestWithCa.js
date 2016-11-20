// 例子：指定根证书
var https = require('https');
var fs = require('fs');
var ca = fs.readFileSync('./srca.cer');

var options = {	
	hostname: 'kyfw.12306.cn',
	path: '/otn/leftTicket/init',
	// cert: fs.readFileSync('./srca.cer'),
	ca: [ca],
	rejectUnauthorized: true,
	requestCert: true,
	// agent: false
};

console.log(ca);

options.agent = new https.Agent(options);

var req = https.request(options, function(res){
	// var cert = res.socket.getPeerCertificate();
	// var raw = res.socket.getPeerCertificate().raw;
	// console.log( raw );
	// fs.writeFileSync('./fuck.cer', raw);

	// res.pipe(process.stdout);
});

req.on('error', function(err){
	console.error(err.code);
});

req.end();

// var request = require('request');

// options = {
// 	uri: 'https://kyfw.12306.cn/otn/leftTicket/init',
// 	method: 'GET',
// 	ca: ca
// };

// request(options, function(err, response, body){

// 	if( err ){

// 		console.log(err);

// 	}else{

// 		console.log(response.statusCode);

// 		console.log(body);

// 	}

// });