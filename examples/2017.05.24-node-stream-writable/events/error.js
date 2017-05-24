var fs = require('fs');
var dest = fs.createWriteStream('./dest.txt');

dest.on('error', function (error) {
    console.log('error: %s', error.message);
});
dest.end();
dest.write('hello');

// 输出：error: write after end
