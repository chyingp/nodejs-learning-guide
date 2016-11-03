var http = require('http');
var zlib = require('zlib');
var fs = require('fs');

var server = http.createServer(function(req, res){
	var acceptEncoding = req.headers['accept-encoding'];
	var gzip;
	if(acceptEncoding.indexOf('gzip')!=-1){
		gzip = zlib.createGzip();
		res.writeHead(200, {
			'Content-Encoding': 'gzip'
		});
		fs.createReadStream('./extra/fileForGzip.html').pipe(gzip).pipe(res);
	}else{
		fs.createReadStream('./extra/fileForGzip.html').pipe(res);
	}

});

server.listen('3100');
