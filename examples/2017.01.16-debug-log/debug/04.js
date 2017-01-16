/**
 * debug：自定义格式化
 */
var createDebug = require('debug')

createDebug.formatters.h = function(v) {
  return v.toUpperCase();
};
 
var debug = createDebug('foo');

// 运行 DEBUG=foo node 04.js 
// 输出 foo My name is CHYINGP +0ms
debug('My name is %h', 'chying');