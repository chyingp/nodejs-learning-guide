var fs = require('fs');
var dest = fs.createWriteStream('./dest.txt', {flags: 'w'});

var max = 16 * 1024;
var buff1 = Buffer.from('a'.repeat(max));
var buff2 = Buffer.from('b'.repeat(max));

dest.cork();

var ret1 = dest.write(buff1);
console.log(ret1);

var ret2 = dest.write(buff2);
console.log(ret2);

dest.uncork();  // 备注：如果注释掉这行代码，内容不会写到 dest.txt 里