var http = require('http');

var parseText = function (req, done) {
    var length = req.headers['content-length'] - 0;
    var arr = [];
    var body;

    req.on('data', buff => {
        arr.push(buff);
    });

    req.on('end', () => {
        body = Buffer.concat(arr);
        done(body);
    })
};

var server = http.createServer(function (req, res) {
    parseText(req, (body) => res.end(body));
});

server.listen(3000);