var log4js = require('log4js');
var logger = log4js.getLogger();
logger.setLevel('INFO');

logger.debug('level: debug');
logger.info('level: info');
logger.error('level: error');