/**
 * debug例子：命名空间
 */
var debug = require('debug');
var appDebug = debug('app');
var apiDebug = debug('api');

// 分别运行下面几行命令看下效果
// 
//     DEBUG=app node 02.js
//     DEBUG=api node 02.js
//     DEBUG=app,api node 02.js
//     DEBUG=a* node 02.js
//     
appDebug('hello');
apiDebug('hello');
