var util = require('util');

var obj = {};

Object.defineProperty(obj, 'nick', {
  enumerable: false,  
  value: 'chyingp'
});

console.log( util.inspect(obj) );
// 输出：{}

console.log( util.inspect(obj, {showHidden: true}) );
// 输出：{ [nick]: 'chyingp' }