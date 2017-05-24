var fs = require('fs');
var dest = fs.createWriteStream('./dest.txt', {flags: 'w'});

dest.write('hello ');
dest.write('world');
dest.end();

// 生成 dest.txt
// 内容：hello world