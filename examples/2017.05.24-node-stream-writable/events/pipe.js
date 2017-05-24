process.stdout.on('pipe', function (src) {
    console.log('src is: process.stdin', src === process.stdin);
});

process.stdin.pipe(process.stdout);

// 运行：
// echo "hello" | node pipe.js

// 输出：
// src is: process.stdin true
// hello