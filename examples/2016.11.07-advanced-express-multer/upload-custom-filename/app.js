var fs = require('fs');
var express = require('express');
var multer  = require('multer')

var app = express();

var createFolder = function(folder){
    try{
        fs.accessSync(folder); 
    }catch(e){
        fs.mkdirSync(folder);
    }  
};

var uploadFolder = './upload/';

createFolder(uploadFolder);

// 通过 filename 属性定制
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);    // 保存的路径，备注：需要自己创建
    },
	filename: function (req, file, cb) {
        // 将保存文件名设置为 字段名 + 时间戳，比如 logo-1478521468943
		cb(null, file.fieldname + '-' + Date.now());  
	}
});

// 通过 storage 选项来对 上传行为 进行定制化
var upload = multer({ storage: storage })

// 单图上传
app.post('/upload', upload.single('logo'), function(req, res, next){
    var file = req.file;
    res.send({ret_code: '0'});
});

app.get('/form', function(req, res, next){
	var form = fs.readFileSync('./form.html', {encoding: 'utf8'});
	res.send(form);
});

app.listen(3000);


