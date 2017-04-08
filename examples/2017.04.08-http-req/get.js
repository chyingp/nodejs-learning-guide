var http = require('http');
var port = 3001;
var url = require('url');
var querystring = require('querystring');

var server = http.createServer(function(req, res, next){
	var reqUrl = req.url;  // 访问地址：/get?nick=chyingp&gender=man
	var query = url.parse(reqUrl).query;  // 请求参数：nick=chyingp&gender=man
	var queryObj = querystring.parse(query);  // 解析后的请求参数：{ nick: 'chyingp', gender: 'man' }
	res.end('ok');
});

server.listen(port, function(){
	console.log('listening on port: %s', port);
});