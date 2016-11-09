var http = require('http');

var server = http.createServer(function(incomingMessage, serverResponse){

});

server.listen(3000);

var client = http.get('http://127.0.0.1', function(){
	
});