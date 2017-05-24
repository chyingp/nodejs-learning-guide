process.stdin.on('readable', function () {
    var buf = process.stdin.read(3);
    console.log(buf);
    process.stdin.read(0);
});

// 关于 readable.read(0) 的解释
// https://nodejs.org/api/stream.html#stream_readable_read_0

// 命令：
// (echo abc; sleep 1; echo def; sleep 1; echo ghi) | node 06.js
// 输出：
// <Buffer 61 62 63>
// <Buffer 0a 64 65>
// <Buffer 66 0a 67>
// <Buffer 68 69 0a>