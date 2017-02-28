var express = require('express');
var log4js = require('log4js');
var app = express();

log4js.configure({
	appenders: [
		{ type: 'console', category: 'app' },
		// { type: 'dateFile', filename: './logs/info.log', category: 'info' }
	]
});

var logger = log4js.getLogger('app');

logger.setLevel('INFO');  // 级别 > INFO 的日志才会被打印

app.use( log4js.connectLogger(logger, { level: 'WARN' }) );  // 级别 <= WARN 的日志才会被打印

app.use(function(req, res, next){
	
	logger.info('info');
	logger.warn('warn');
	logger.error('error');
	
	res.send('ok');
});

app.listen(3000);