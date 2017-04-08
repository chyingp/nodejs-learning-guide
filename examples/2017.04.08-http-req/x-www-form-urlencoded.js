var http = require('http');
var port = 3001;
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req, res, next){
	
	var content = req.headers['content-type'];
	var method = req.method;
	var chunk = Buffer.alloc(0);
	
	req.on('data', function(buf){
		chunk = Buffer.concat([chunk, buf]);
	});
	req.on('end', function(){
		var obj = querystring.parse( chunk.toString() );
		res.end(obj);  // nick=chyingp&gender=man
	});
});

server.listen(port, function(){
	console.log('listening on port: %s', port);
});