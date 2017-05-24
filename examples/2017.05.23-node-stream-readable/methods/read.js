var fs = require('fs');
var readable = fs.createReadStream('./jquery-3.2.1.js');

readable.on('readable', function (chunk) {
  var chunk;  
  while (null !== (chunk = readable.read())) {
    console.log(`Received ${Math.ceil(chunk.length/1024)} kb of data.`);
  }    
});

// 输出
// Received 64 kb of data.
// Received 64 kb of data.
// Received 64 kb of data.
// Received 64 kb of data.
// Received 6 kb of data.