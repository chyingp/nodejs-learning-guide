const crypto = require('crypto');

// 参数一：摘要函数
// 参数二：秘钥
let hmac = crypto.createHmac('md5', '123456');
let ret = hmac.update('hello').digest('hex');

console.log(ret);
// 9c699d7af73a49247a239cb0dd2f8139
