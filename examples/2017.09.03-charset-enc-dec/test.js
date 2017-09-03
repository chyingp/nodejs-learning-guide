var iconv = require('iconv-lite');

var text = '你';
var buff;

buff = iconv.encode(text, 'utf8');
console.log(buff);

buff = iconv.encode(text, 'gbk');
console.log(buff);