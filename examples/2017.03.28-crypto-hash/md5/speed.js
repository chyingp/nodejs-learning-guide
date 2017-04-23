var fs = require('fs');
var content = fs.readFileSync('./jquery.js');
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

console.time('md5 cost');

var result = md5.update(content).digest('base64');
console.log('conetnt.length: %s', content.length);

console.timeEnd('md5 cost');