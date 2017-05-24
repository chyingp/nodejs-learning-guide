var max = 64 * 1024;
var buff = Buffer.from('a'.repeat(max));

var fs = require('fs');
var dest = fs.createWriteStream('./dest.txt', {flags: 'w'});

var index = 0;

function write () {
    var ret;
    for(; index <= max - 1; index++) {
        ret = dest.write(Buffer.from('a'));
        if(ret === false){
            console.log('暂时不能写入数据，index === %d', index);
            break;
        }
    }
    if(index === max -1) dest.end();
}

dest.on('drain', function () {
    console.log('drain触发，继续写入数据');
    write();
});

write();