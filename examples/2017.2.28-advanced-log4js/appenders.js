var log4js = require('log4js');

log4js.configure({
	appenders: [
		{ type: 'console'},
		{ type: 'dateFile', filename: './logs/info.log', category: 'info' }
	]
});

var logger = log4js.getLogger('info');
logger.setLevel('INFO');

logger.trace('trace');
logger.debug('debug');
logger.info('info');