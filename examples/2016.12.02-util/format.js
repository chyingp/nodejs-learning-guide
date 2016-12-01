var util = require('util');

console.log( util.format('hello %s', 'world') );
// 输出：hello world

console.log( util.format('1 + 1 = %d', 2) );
// 输出：1 + 1 = 2

console.log( util.format('info: %j', {nick: 'chyingp'}) );
// 输出：info: {"nick":"chyingp"}

console.log( util.format('%s is %d age old', 'chyingp') );
// 输出：chyingp is %d age old

console.log( util.format('%s is a man', 'chyingp', 'indeed') );
// 输出：chyingp is a man indeed

