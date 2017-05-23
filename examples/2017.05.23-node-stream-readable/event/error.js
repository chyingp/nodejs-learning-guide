var fs = require('fs');
var readstream = fs.createReadStream('./none-exists.txt');

readstream.on('error', function (error) {
    console.log('on error: %s', error.message);
});

// 输出
// 1、没有添加 error 事件监听时，直接报错退出
// events.js:160
//       throw er; // Unhandled 'error' event
//       ^

// Error: ENOENT: no such file or directory, open './none-exists.txt'
//     at Error (native)
//
// 2、有添加 error 事件监听时
// on error: ENOENT: no such file or directory, open './none-exists.txt'
