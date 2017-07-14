var Writable = require('stream').Writable;
var fs = require('fs');

class MyWritable extends Writable {
    constructor (filepath) {
        super({});
        this._dest = fs.createWriteStream(filepath, {flags: 'w'});        
    }

    _write (chunk, encoding, next) {        
        this._dest.write(chunk.toString().toUpperCase(), 'utf8')
        next();
    }
}

var w = new MyWritable('./dest.txt');
w.write('hello ');
w.write('world');
w.end();