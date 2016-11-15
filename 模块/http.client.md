## ClientRequest概览

在前面的章节里，已经对http模块的的其他方面进行了不少介绍。有了前面的基础，这里就没必要进行过多重复性的介绍，更多的以例子为主。

## 简单的GET请求

下面构造了个GET请求，访问 http://id.qq.com/ ，并将返回的网页内容打印在控制台下。

```js
var http = require('http');
var options = {
    protocol: 'http:',
    hostname: 'id.qq.com',
    port: '80',
    path: '/',
    method: 'GET'
};

var client = http.request(options, function(res){
    var data = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk){
        data += chunk;
    });
    res.on('end', function(){
        console.log(data);
    });
});

client.end();
```

## 简单的post请求

