process.stdin.on('readable', function () {
    var buf = process.stdin.read(3);
    console.dir(buf);
});

// 运行：
// (echo abc; sleep 1; echo def; sleep 1; echo ghi) | node 05.js
// 输出：
// Buffer [ 97, 98, 99 ]
// Buffer [ 10, 100, 101 ]
// Buffer [ 102, 10, 103 ]