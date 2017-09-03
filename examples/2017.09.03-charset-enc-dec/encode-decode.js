var iconv = require('iconv-lite');

var oriText = '你';

var encodedBuff = iconv.encode(oriText, 'gbk');
console.log(encodedBuff);
// <Buffer c4 e3>

var decodedText = iconv.decode(encodedBuff, 'gbk');
console.log(decodedText);
// 你

var wrongText = iconv.decode(encodedBuff, 'utf8');
console.log(wrongText);
// ��