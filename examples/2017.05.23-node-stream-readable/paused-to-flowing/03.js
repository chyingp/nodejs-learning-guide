var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');

console.log('1. isPaused: ' + readstream.isPaused());

setTimeout(function() {
    readstream.pipe(process.stdout);

    console.log('2. isPaused: ' + readstream.isPaused());

    readstream.on('end', function () {
        console.log('3. isPaused: ' + readstream.isPaused());
    });    
}, 3000);