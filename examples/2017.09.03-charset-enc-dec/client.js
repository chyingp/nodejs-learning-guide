var http = require('http');
var iconv = require('iconv-lite');

var charset = 'gbk';

// 对字符"你"进行编码
var reqBuff = iconv.encode('你', charset);

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Encoding': 'identity',
        'Charset': charset // 设置请求字符集编码
    }
};

var client = http.request(options, function(res) {
    res.pipe(process.stdout);
});

client.end(reqBuff);