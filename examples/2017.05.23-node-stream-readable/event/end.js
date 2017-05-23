var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');

readstream.on('data', function (chunk) {
    console.log('on data: %s', chunk);
});

readstream.on('end', function () {
    console.log('on end');
});

readstream.on('close', function () {
    console.log('on close');
});

// 输出：
// on data: hello world
// on end
// on close