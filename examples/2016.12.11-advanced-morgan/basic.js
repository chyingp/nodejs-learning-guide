var express = require('express');
var app = express();
var morgan = require('morgan');
var bodyParser = require('body-parser');

app.use(morgan('short'));
app.use(function(req, res, next){
	res.send('ok');
});

app.listen(3000);