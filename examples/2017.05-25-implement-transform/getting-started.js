var Transform = require('stream').Transform;
var fs = require('fs');

class UpperCaseTransform extends Transform {
    constructor (options = {}) {
        super(options);
    }

    _transform (chunk, encoding, callback) {
        // 只处理传字符串的情况
        this.push(chunk.toString().toUpperCase());
        callback();
    }

    _flush (callback) {
        this.push(', TRANSFORM END');
        callback(null);
    }
}

var src = fs.createReadStream('./src.txt', {flags: 'r'});
var dest = fs.createWriteStream('./dest.txt', {flags: 'w'});

src.pipe(new UpperCaseTransform()).pipe(dest);

// 执行：
// echo "hello world" | node getting-started.js

// 输出：dest.txt
// 内容：HELLO WORLD