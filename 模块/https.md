## 模块概览

关于这个模块的重要性，基本不用强调了，在网络安全问题日以严峻的今天，HTTPS是个必然的趋势。

## 客户端例子

跟http模块的用法非常像，只不过请求的地址是https协议的而已。

```js
var https = require('https');

https.get('https://www.baidu.com', function(res){
    console.log('status code: ' + res.statusCode);
    console.log('headers: ' + res.headers);

    res.on('data', function(data){
        process.stdout.write(data);
    });
}).on('error', function(err){
    console.error(err);
});
```

## 入门示例

TODO

## 基础讲解

。。。


## 本地证书

。。。


## 相关链接