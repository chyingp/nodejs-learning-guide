var util = require('util');
var firstLogger = util.debuglog('first');
var secondLogger = util.debuglog('second');
var thirdLogger = util.debuglog('third');

firstLogger('hello');
secondLogger('hello');
thirdLogger('hello');