// 例子：正常访问
var https = require('https');

https.get('https://www.baidu.com', function(res){
	res.on('data', function(data){
		process.stdout.write(data);
	});
}).on('error', function(err){
	console.error(err);
});

/*
{ Error: self signed certificate in certificate chain
    at Error (native)
    at TLSSocket.<anonymous> (_tls_wrap.js:1055:38)
    at emitNone (events.js:86:13)
    at TLSSocket.emit (events.js:185:7)
    at TLSSocket._finishInit (_tls_wrap.js:580:8)
    at TLSWrap.ssl.onhandshakedone (_tls_wrap.js:412:38) code: 'SELF_SIGNED_CERT_IN_CHAIN' }

 */