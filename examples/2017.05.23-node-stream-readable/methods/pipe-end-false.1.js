var fs = require('fs');
var src = fs.createReadStream('./hello.txt');
var dest = fs.createWriteStream('./dest.txt');

src.pipe(dest, { end: false });

src.on('end', function () {
    dest.end(' end');
    console.log('end');
});