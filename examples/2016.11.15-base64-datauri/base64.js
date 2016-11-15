var fs = require('fs');
var filepath = './1.png';

var bData = fs.readFileSync(filepath);
var base64Str = bData.toString('base64');
var datauri = 'data:image/png;base64,' + base64Str;

console.log(datauri);