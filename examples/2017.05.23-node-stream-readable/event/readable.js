var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');
readstream.on('readable', function() {
  console.log('readable: %s', readstream.read());
});
readstream.on('end', function() {
  console.log('end');
});

// 输出：
// readable: hello world
// readable: null
// end