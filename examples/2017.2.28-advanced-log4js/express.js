var express = require('express');
var log4js = require('log4js');
var app = express();

log4js.configure({
	appenders: [
		{ type: 'console', category: 'app' }
	]
});

var logger = log4js.getLogger('app');

logger.setLevel('INFO');  // 级别 > INFO 的日志才会被打印

app.use( log4js.connectLogger(logger, {level: 'WARN'}) );

app.use('/index', function(req, res, next){
	res.send('ok');
});

app.listen(3000);