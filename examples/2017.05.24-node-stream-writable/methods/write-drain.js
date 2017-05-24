var max = 16 * 1024;
var buff = Buffer.alloc(max);

var fs = require('fs');
var dest = fs.createWriteStream('./dest.txt', {flags: 'w'});

var ret = dest.write( Buffer.alloc(max -1) );
console.log(ret);  // true

ret = dest.write( Buffer.alloc(1) );
console.log(ret);  // false