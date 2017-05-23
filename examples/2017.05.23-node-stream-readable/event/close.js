var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');

readstream.on('data', function (chunk) {
    console.log('on data: %s', chunk);
});

readstream.on('close', function () {
    console.log('on close');
});

// 输出
// on data: hello world
// on close