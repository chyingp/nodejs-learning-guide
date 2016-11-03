var dns = require('dns');

dns.lookup('www.qq.com', function(err, address, family){
	if(err) throw err;
	console.log('配置host后，dns.lokup =>' + address);
});

dns.resolve4('www.qq.com', function(err, address, family){
	if(err) throw err;
	console.log('配置host后，dns.resolve4 =>' + address);
});