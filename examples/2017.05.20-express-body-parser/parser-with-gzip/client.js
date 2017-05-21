var http = require('http');
var zlib = require('zlib');

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Encoding': 'gzip'
    }
};

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

// 注意：将 Content-Encoding 设置为 gzip 的同时，发送给服务端的数据也应该先进行gzip
var buff = zlib.gzipSync('chyingp');

client.end(buff);