var http = require('http');
var iconv = require('iconv-lite');

var encoding = 'gbk';

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/test',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain; charset=' + encoding,
        'Content-Encoding': 'identity',        
    }
};

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

var buff = iconv.encode('程序猿小卡', encoding);

client.end(buff, encoding);