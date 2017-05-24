var fs = require('fs');
var dest = fs.createWriteStream('./dest.txt');
var buff = Buffer.from('好');

dest.setDefaultEncoding('utf8');
dest.end(buff);