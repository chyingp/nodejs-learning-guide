var crypto = require('crypto');
var md5 = crypto.createHash('md5');

var result = md5.update('a').digest('base64');

// 输出：DMF1ucDxtqgxw5niaXcmYQ==
console.log(result);

