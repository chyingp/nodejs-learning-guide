var fs = require('fs');

var onEnd = function(){
	process.stdout.write(']');	
};

var fileStream = fs.createReadStream('./sample.txt');

process.stdout.write('文件读取完成，文件内容是[');

fileStream.on('end', onEnd).pipe(process.stdout);;



