var Writable = require('stream').Writable;

var myWritable = new Writable({
    
    highWaterMark: 1,  // 最大同时写入1kb，默认是16kb

    decodeStrings: false,  // 是否先将string转成buffer再传入 .write()，默认是true

    objectMode: true,  // writable.write(obj) 是否合法，默认是false
    
    write (chunk, encoding, next) {
        if (typeof chunk === 'object') {
            next();
        } else if (typeof chunk === 'string') {
            next();
        } else if (Buffer.isBuffer(chunk)) {
            next();
        } else {
            next(new Error('myWritable: .write() is called with wrong type'));
        }
    }
});

process.stdin.pipe(myWritable);
