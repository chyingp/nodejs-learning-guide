// dns.lookup(hostname[, options], callback)
var dns = require('dns');

var options = {
	all: true  // 默认是false,只返回一个地址
};

dns.lookup('www.qq.com', function(err, address, family){
	if(err) throw err;
	console.log('例子A: ' + address);
});

dns.lookup('www.qq.com', options, function (err, address){
	if(err) throw err;
	console.log( '例子B: ' + JSON.stringify(address) );
});

dns.lookup('id.chyingp.com', function(err, address, family){
	if(err) throw err;
	console.log('例子C: ' + address);
});