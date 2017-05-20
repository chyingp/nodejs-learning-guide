var express = require('express');
var bodyParser = require('body-parser');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));

app.get('/test', function (req, res, next) {    
    // 访问地址为：http://127.0.0.1:3030/test?nick=chyingp
    // 输出为：nick is chyingp
    res.end(`nick is ${req.query.nick}`);
});

app.listen(3030);