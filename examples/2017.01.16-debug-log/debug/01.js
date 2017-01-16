/**
 * debug基础例子
 */
var debug = require('debug')('app');

// 运行 DEBUG=app node 01.js
// 输出：app hello +0ms
debug('hello');
