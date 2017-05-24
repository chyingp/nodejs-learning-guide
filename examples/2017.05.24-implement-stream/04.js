process.stdin.on('readable', function () {
    var buff = process.stdin.read();
    console.dir(buff);
});

// 运行：
// (echo abc; sleep 1; echo def; sleep 1; echo ghi) | node 04.js
// 输出：
// Buffer [ 97, 98, 99, 10 ]
// Buffer [ 100, 101, 102, 10 ]
// Buffer [ 103, 104, 105, 10 ]
// null