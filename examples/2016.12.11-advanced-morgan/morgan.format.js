var express = require('express');
var app = express();
var morgan = require('morgan');

morgan.format('joke', '[joke] :method :url :status');

app.use(morgan('joke'));

app.use(function(req, res, next){
	res.send('ok');
});

app.listen(3000);