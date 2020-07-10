var http = require('http');

// 如果Content-Type是 text/html 则访问页面显示hello , 两秒后又被附加 world
//  如果Content-Type是 text/html 则访问页面会延迟两秒才打开，直接显示 hello world
//  而且 setTimeout里的 res.en()语句不能放在外面，否则会报错 Error: write after end
http.createServer(function(req, res) {    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write('hello');

    setTimeout(function() {
        res.write(' world!');
        res.end();
    }, 3000);
    
}).listen(3000);