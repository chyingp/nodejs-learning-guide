var crypto = require('crypto');
var secret = 'secret';

var cipher = crypto.createCipher('aes192', secret);
var content = 'hello';
var cryptedContent;

cipher.update(content);
cryptedContent = cipher.final('hex');
console.log(cryptedContent);
// 输出：
// 71d30ec9bc926b5dbbd5150bf9d3e5fb


var decipher = crypto.createDecipher('aes192', secret);
var decryptedContent;

decipher.update(cryptedContent, 'hex');
decryptedContent = decipher.final('utf8');
console.log(decryptedContent);
