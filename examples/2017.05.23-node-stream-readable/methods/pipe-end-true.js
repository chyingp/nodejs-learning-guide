var fs = require('fs');
var src = fs.createReadStream('./hello.txt');
var dest = fs.createWriteStream('./dest.txt');

src.pipe(dest);

src.on('end', function () {
    try{
        dest.end(' end');
    }catch(error){
        console.log('error! error.message is %s', error.message);
    }
    
    console.log('end');
});