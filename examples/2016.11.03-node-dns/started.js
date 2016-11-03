var dns = require('dns');
var domain = 'ke.qq.com';
var ip = '10.136.149.168';
var port = 80;

// 会受到本地host影响
dns.lookup('ke.qq.com', function onLookup(err, addresses, family) {
  if (err) throw err;
  console.log('addresses from lookup:', addresses);
});

// 不会收到本地host影响
dns.resolve4('ke.qq.com', function (err, addresses) {
  if (err) throw err;
  console.log('addresses from resolve4: ' + JSON.stringify(addresses));
});

// 通过ip反查域名
dns.lookupService(ip, port, function(err, hostname, service){
	if (err) throw err;
	console.log(hostname);
});