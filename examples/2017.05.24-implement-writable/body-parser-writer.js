var Writable = require('stream').Writable;

// 自定义Writable Stream
class HeaderParser extends Writable {
    constructor (callback) {
        super({});
        this.callback = callback;
        this.chunks = [];

        this.on('finish', () => {
            let buff = Buffer.concat(this.chunks);
            let body = JSON.parse(buff.toString());
            this.callback( body );
        });
    }

    _write(chunk, encoding, callback) {
        this.chunks.push(chunk);
        callback();
    }
}

var http = require('http');
var server = http.createServer(function (req, res) {
    req.pipe(new HeaderParser(function (body) {
        res.end(body.nick);
    }));
});
server.listen(3000);