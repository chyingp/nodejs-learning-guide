var fs = require('fs');
var dest = fs.createWriteStream('./dest.txt');

process.stdin.pipe(dest);

// 运行：
// echo "hello world from chyingp" | node pipe.js

// 生成 dest.txt
// 内容：hello world from chyingp
