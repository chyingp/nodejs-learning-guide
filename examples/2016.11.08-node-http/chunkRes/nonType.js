var http = require('http');

http.createServer(function(req, res) {    
    // res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write('hello');

    setTimeout(function() {
        res.write(' world!');
        res.end();
    }, 2000);

}).listen(3000);