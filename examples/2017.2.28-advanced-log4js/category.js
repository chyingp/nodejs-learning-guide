var log4js = require('log4js');
var alogger = log4js.getLogger('category-a');
var blogger = log4js.getLogger('category-b');

alogger.info('hello');
blogger.info('hello');