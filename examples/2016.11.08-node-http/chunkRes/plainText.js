var http = require('http');

http.createServer(function (req, res) {
    res.writeHead(200, {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Content-Type-Options': 'nosniff'
    });
    res.write('hello');

    setTimeout(function(){
        res.write('world');
        res.end()
    }, 2000);
    
}).listen(3000);