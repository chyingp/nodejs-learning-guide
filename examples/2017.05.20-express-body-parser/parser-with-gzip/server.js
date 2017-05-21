var http = require('http');
var zlib = require('zlib');

var parsePostBody = function (req, done) {
    var length = req.headers['content-length'] - 0;
    var contentEncoding = req.headers['content-encoding'];
    var stream = req;

    if(contentEncoding === 'gzip') {
        stream = zlib.createGunzip();
        req.pipe(stream);
    }

    var arr = [];
    var chunks;

    stream.on('data', buff => {
        arr.push(buff);
    });

    stream.on('end', () => {
        chunks = Buffer.concat(arr);        
        done(chunks);
    });

    stream.on('error', error => console.error(error.message));
};

var server = http.createServer(function (req, res) {
    parsePostBody(req, (chunks) => {
        var body = chunks.toString();
        res.end(`Your nick is ${body}`)
    });
});

server.listen(3000);