var Writable = require('stream').Writable;
var fs = require('fs');

class MyWritable extends Writable {
    constructor (filepath) {
        super({});
        this._dest = fs.createWriteStream(filepath, {flags: 'w'});
    }

    _writev (chunks, callback) {
        chunks.forEach(item => {
            this._dest.write(item.chunk, item.encoding);
        });
        callback();
    }
}

var mw = new MyWritable('./dest.txt');
mw.cork();
mw.write('hello');
mw.write('world');
process.nextTick(() => mw.uncork());