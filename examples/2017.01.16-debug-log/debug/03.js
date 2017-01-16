/**
 * debug例子：排查命名空间
 */
var debug = require('debug');
var listDebug = debug('app:list');
var profileDebug = debug('app:profile');
var loginDebug = debug('account:login');

// 分别运行下面几行命令看下效果
// 
//     DEBUG=* node 03.js
//     DEBUG=*,-account* node 03.js
//     
listDebug('hello');
profileDebug('hello');
loginDebug('hello');