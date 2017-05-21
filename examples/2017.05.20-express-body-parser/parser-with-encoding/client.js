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

// 备注：nodejs本身不支持gbk编码，所以请求发送前，需要先进行编码
var buff = iconv.encode('程序猿小卡', encoding);

var client = http.request(options, (res) => {
    res.pipe(process.stdout);
});

client.end(buff, encoding);