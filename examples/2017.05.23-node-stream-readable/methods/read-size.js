var fs = require('fs');
var readable = fs.createReadStream('./jquery-3.2.1.js');
var size = 1024 * 32;  // 32k

readable.on('readable', function (chunk) {
  var chunk;  
  while (null !== (chunk = readable.read(size))) {
    console.log(`Received ${Math.ceil(chunk.length/1024)} kb of data.`);
  }    
});

// 输出
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 6 kb of data.