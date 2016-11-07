var fs = require('fs');
var express = require('express');
var multer  = require('multer')

var app = express();
var uploadSingle = multer({ dest: 'upload-single/' });
var uploadMulti = multer({ dest: 'upload-multi/' });

// 单图上传
app.post('/upload-single', uploadSingle.single('logo'), function(req, res, next){
	res.send({ret_code: '0'});
});

// 多图上传
app.post('/upload-multi', uploadMulti.array('logos', 2), function(req, res, next){
	res.send({ret_code: '0'});
});

app.get('/form', function(req, res, next){
	var form = fs.readFileSync('./form.html', {encoding: 'utf8'});
	res.send(form);
});

app.listen(3000);


