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

## 客户端例子：不受信任的证书

我们知道，有些网站的HTTPS证书会被浏览器标识为不受信任，有可能是以下情况导致的：

* 颁发证书的机构不在操作系统的受信列表里
* 办法证书的机构在操作系统的受信列表里，但证书的安全级别不够

比如我们访问[12306](https://kyfw.12306.cn/otn/regist/init)，chrome就会提示你“您的连接不是私密连接，攻击者可能会试图从kyfw.12306.cn窃取您的信息”。

那么，当我们用node向12306发起请求时，又会是什么状况呢？下面就来试下

```js
var https = require('https');

https.get('https://www.baidu.com', function(res){
    res.on('data', function(data){
        process.stdout.write(data);
    });
}).on('error', function(err){
    console.error(err);
});
```

运行上面代码，输出如下。可以看到出现报错，提示信息是“self signed certificate in certificate chain”。大意就是说证书是网站自己签发的，不安全。

```bash
{ Error: self signed certificate in certificate chain
    at Error (native)
    at TLSSocket.<anonymous> (_tls_wrap.js:1055:38)
    at emitNone (events.js:86:13)
    at TLSSocket.emit (events.js:185:7)
    at TLSSocket._finishInit (_tls_wrap.js:580:8)
    at TLSWrap.ssl.onhandshakedone (_tls_wrap.js:412:38) code: 'SELF_SIGNED_CERT_IN_CHAIN' }
```

出现上述错误怎么处理呢？我们知道，如果是在浏览器里访问，有两种处理方式：

* 忽略浏览器的安全提示，继续访问（浏览器可能会直接禁止你访问）
* 将网站的根证书导入到操作系统的受信任根证书列表里



## 入门示例

TODO

## 基础讲解

。。。


## 本地证书

。。。


## 相关链接