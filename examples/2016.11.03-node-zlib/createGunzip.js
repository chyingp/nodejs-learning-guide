var fs = require('fs');
var zlib = require('zlib');

var gunzip = zlib.createGunzip();

var inFile = fs.createReadStream('./extra/fileForCompress.txt.gz');
var outFile = fs.createWriteStream('./extra/fileForCompress1.txt');

inFile.pipe(gunzip).pipe(outFile);