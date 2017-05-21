var http = require('http');
var querystring = require('querystring');

var parseURLEncoded = function (req, done) {
    var length = req.headers['content-length'] - 0;
    var arr = [];
    var chunks;

    req.on('data', buff => {
        arr.push(buff);
    });

    req.on('end', () => {
        chunks = Buffer.concat(arr);
        done(chunks);
    });
};

var server = http.createServer(function (req, res) {
    parseURLEncoded(req, (chunks) => {
        var body = querystring.parse( chunks.toString() );
        res.end(`Your nick is ${body.nick}`)
    });
});

server.listen(3000);