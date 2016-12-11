var morgan = require('morgan');
var format = morgan['tiny'];
var fn = morgan.compile(format);

console.log(fn.toString());