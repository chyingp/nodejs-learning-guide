var fs = require('fs');
var http = require('http');

var tmpl = '<!DOCTYPE html>\
<html>\
	<head>\
		<title>datauri例子</title>\
	</head>\
<body>\
	<img src="$datauri" />\
</body>\
</html>';

var server = http.createServer(function(req, res){
	var filepath = './1.png';

	var bData = fs.readFileSync(filepath);
	var base64Str = bData.toString('base64');
	var datauri = 'data:image/png;base64,' + base64Str;	

	res.end( tmpl.replace('$datauri', datauri) );
});

server.listen(3000);