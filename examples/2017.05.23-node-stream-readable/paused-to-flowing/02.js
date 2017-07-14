var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');

console.log('1. isPaused: ' + readstream.isPaused());

readstream.resume();

console.log('2. isPaused: ' + readstream.isPaused());

setTimeout(function() {
    readstream.on('data', function (content) {
        console.log(`4. content is [ %s ]` + content);
    });
    console.log('3. isPaused: ' + readstream.isPaused());
}, 3000);