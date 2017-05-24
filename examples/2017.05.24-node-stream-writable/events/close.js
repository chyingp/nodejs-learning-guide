var fs = require('fs');
var dest = fs.createWriteStream('./dest.txt');

dest.on('close', function (error) {
    console.log('event: close');
});

dest.on('pipe', function (error) {
    console.log('event: pipe');
});

dest.on('finish', function (error) {
    console.log('event: finish');
});

process.stdin.pipe(dest);

// 输出：
// event: pipe
// event: finish
// event: close
