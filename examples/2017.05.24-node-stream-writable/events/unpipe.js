process.stdout.on('unpipe', function (src) {
    console.log('src is: process.stdin', src === process.stdin);
});

process.stdin.pipe(process.stdout);
process.stdin.unpipe(process.stdout);

// 运行：
// node unpipe.js

// 输出：
// src is: process.stdin true