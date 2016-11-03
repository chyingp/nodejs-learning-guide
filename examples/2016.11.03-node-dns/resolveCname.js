var dns = require('dns');

dns.resolveCname('ke.qq.com', function(err, address){
	if(err) throw err;
	console.log( JSON.stringify(address) );
});