var express = require('express');
var app = express();
var morgan = require('morgan');

// 自定义token
morgan.token('from', function(req, res){
	return req.query.from || '-';
});

// 自定义format，其中包含自定义的token
morgan.format('joke', '[joke] :method :url :status :from');

// 使用自定义的format
app.use(morgan('joke'));

app.use(function(req, res, next){
	res.send('ok');
});

app.listen(3000);