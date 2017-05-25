var Writable = require('stream').Writable;

var myWritable = new Writable({
    writev (chunks, callback) {
        chunks.forEach(item => {
            this._write(item.chunk, item.encoding);        
        });
        callback();
    }
});

process.stdin.pipe(myWritable);