var crypto = require('crypto');
var secret = 'secret';
var cipher = crypto.createCipher('aes192', secret);
var content = 'hello';

cipher.update(content);

console.log( cipher.final('hex'));
// 输出：
// 71d30ec9bc926b5dbbd5150bf9d3e5fb