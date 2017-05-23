var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');
var readstream2 = fs.createReadStream('./hello.txt');
var readstream3 = fs.createReadStream('./hello.txt');

readstream.on('data', function (chunk) {
    console.log('1. chunk type is Buffer ? %s', Buffer.isBuffer(chunk));
});

readstream2.setEncoding('utf8');
readstream2.on('data', function (chunk) {
    console.log('2. chunk type is String ? %s', typeof chunk === 'string');    
});

readstream3.setEncoding('utf8');
readstream3.on('data', function (chunk) {
    console.log('3. data is: %s', chunk);
});

// 输出
// 1. chunk type is Buffer ? true
// 2. chunk type is String ? true
// 3. data is: hello world