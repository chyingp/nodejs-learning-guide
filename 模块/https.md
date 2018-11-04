## 模块概览

这个模块的重要性，基本不用强调了。在网络安全问题日益严峻的今天，网站采用HTTPS是个必然的趋势。

在nodejs中，提供了 https 这个模块来完成 HTTPS 相关功能。从官方文档来看，跟 http 模块用法非常相似。

本文主要包含两部分：

1. 通过客户端、服务端的例子，对https模块进行入门讲解。
2. 如何访问安全证书不受信任的网站。（以 12306 为例子）

篇幅所限，本文无法对 HTTPS协议 及 相关技术体系 做过多讲解，有问题欢迎留言交流。

## 客户端例子

跟http模块的用法非常像，只不过请求的地址是https协议的而已，代码如下：

```js
var https = require('https');

https.get('https://www.baidu.com', function(res){
    console.log('status code: ' + res.statusCode);
    console.log('headers: ' + JSON.stringify(res.headers));

    res.on('data', function(data){
        process.stdout.write(data);
    });
}).on('error', function(err){
    console.error(err);
});
```

## 服务端例子

对外提供HTTPS服务，需要有HTTPS证书。如果你已经有了HTTPS证书，那么可以跳过证书生成的环节。如果没有，可以参考如下步骤

### 生成证书

#### 1、创建个目录存放证书。

```bash
mkdir cert
cd cert
```

#### 2、生成私钥。

```
openssl genrsa -out chyingp-key.pem 2048
```

#### 3、生成证书签名请求（csr是 Certificate Signing Request的意思）。

```
openssl req -new \
  -sha256
  -key chyingp-key.key.pem \
  -out chyingp-csr.pem \
  -subj "/C=CN/ST=Guandong/L=Shenzhen/O=YH Inc/CN=www.chyingp.com"
```

#### 4、生成证书。

```
openssl x509 \
  -req -in chyingp-csr.pem \
  -signkey chyingp-key.pem \
  -out chyingp-cert.pem
```

### HTTPS服务端

代码如下：

```js
var https = require('https');
var fs = require('fs');

var options = {
    key: fs.readFileSync('./cert/chyingp-key.pem'), // 私钥
    cert: fs.readFileSync('./cert/chyingp-cert.pem') // 证书
};

var server = https.createServer(options, function(req, res){
    res.end('这是来自HTTPS服务器的返回');
});

server.listen(3000);
```

由于我并没有 www.chyingp.com 这个域名，于是先配置本地host

```
127.0.0.1 www.chyingp.com
```

启动服务，并在浏览器里访问 [http://www.chyingp.com:3000](http://www.chyingp.com:3000)。注意，浏览器会提示你证书不可靠，点击 信任并继续访问 就行了。

## 进阶例子：访问安全证书不受信任的网站

这里以我们最喜爱的12306最为例子。当我们通过浏览器，访问12306的购票页面 https://kyfw.12306.cn/otn/regist/init 时，chrome会阻止我们访问，这是因为，12306的证书是自己颁发的，chrome无法确认他的安全性。

对这种情况，可以有如下处理方式：

1. 停止访问：着急抢票回家过年的老乡表示无法接受。
2. 无视安全警告，继续访问：大部分情况下，浏览器是会放行的，不过安全提示还在。
3. 导入12306的CA根证书：浏览器乖乖就范，认为访问是安全的。（实际上还是有安全提示，因为12306用的签名算法安全级别不够）

### 例子：触发安全限制

同样的，通过 node https client 发起请求，也会遇到同样问题。我们做下实验，代码如下：

```js
var https = require('https');

https.get('https://kyfw.12306.cn/otn/regist/init', function(res){   
    res.on('data', function(data){
        process.stdout.write(data);
    });
}).on('error', function(err){
    console.error(err);
});
```

运行上面代码，得到下面的错误提示，意思是 安全证书不可靠，拒绝继续访问。

```bash
{ Error: self signed certificate in certificate chain
    at Error (native)
    at TLSSocket.<anonymous> (_tls_wrap.js:1055:38)
    at emitNone (events.js:86:13)
    at TLSSocket.emit (events.js:185:7)
    at TLSSocket._finishInit (_tls_wrap.js:580:8)
    at TLSWrap.ssl.onhandshakedone (_tls_wrap.js:412:38) code: 'SELF_SIGNED_CERT_IN_CHAIN' }
```

ps：个人认为这里的错误提示有点误导人，12306网站的证书并不是自签名的，只是对证书签名的CA是12306自家的，不在可信列表里而已。自签名证书，跟自己CA签名的证书还是不一样的。

类似在浏览器里访问，我们可以采取如下处理：

1. 不建议：忽略安全警告，继续访问；
2. 建议：将12306的CA加入受信列表；

### 方法1：忽略安全警告，继续访问

非常简单，将 rejectUnauthorized 设置为 false 就行，再次运行代码，就可以愉快的返回页面了。

```js
// 例子：忽略安全警告
var https = require('https');

var options = { 
    hostname: 'kyfw.12306.cn',
    path: '/otn/leftTicket/init',
    rejectUnauthorized: false  // 忽略安全警告
};

var req = https.get(options, function(res){ 
    res.pipe(process.stdout);   
});

req.on('error', function(err){
    console.error(err.code);
});
```

### 方法2：将12306的CA加入受信列表

这里包含3个步骤：

1. 下载 12306 的CA证书
2. 将der格式的CA证书，转成pem格式
3. 修改node https的配置

#### 1、下载 12306 的CA证书

在12306的官网上，提供了CA证书的[下载地址](http://www.12306.cn/mormhweb/ggxxfw/wbyyzj/201106/srca12306.zip)，将它保存到本地，命名为 srca.cer。

#### 2、将der格式的CA证书，转成pem格式

https初始化client时，提供了 ca 这个配置项，可以将 12306 的CA证书添加进去。当你访问 12306 的网站时，client就会用ca配置项里的 ca 证书，对当前的证书进行校验，于是就校验通过了。

需要注意的是，ca 配置项只支持 pem 格式，而从12306官网下载的是der格式的。需要转换下格式才能用。关于 pem、der的区别，可参考 [这里](https://support.ssl.com/Knowledgebase/Article/View/19/0/der-vs-crt-vs-cer-vs-pem-certificates-and-how-to-convert-them)。

```bash
openssl x509 -in srca.cer -inform der -outform pem -out srca.cer.pem
```

#### 3、修改node https的配置

修改后的代码如下，现在可以愉快的访问12306了。

```js
// 例子：将12306的CA证书，加入我们的信任列表里
var https = require('https');
var fs = require('fs');
var ca = fs.readFileSync('./srca.cer.pem');

var options = { 
  hostname: 'kyfw.12306.cn',
  path: '/otn/leftTicket/init',
  ca: [ ca ]
};

var req = https.get(options, function(res){ 
  res.pipe(process.stdout); 
});

req.on('error', function(err){
  console.error(err.code);
});
```

## 相关链接

[Why is my node.js SSL connection failing to connect?](http://www.thedreaming.org/2016/09/27/nodejs-ssl/)

[DER vs. CRT vs. CER vs. PEM Certificates and How To Convert Them](https://support.ssl.com/Knowledgebase/Article/View/19/0/der-vs-crt-vs-cer-vs-pem-certificates-and-how-to-convert-them)

[Painless Self Signed Certificates in node.js](https://github.com/Daplie/node-ssl-root-cas/wiki/Painless-Self-Signed-Certificates-in-node.js)

[利用OpenSSL创建自签名的SSL证书备忘（自建ca）](http://wangye.org/blog/archives/732/)

[OpenSSL 与 SSL 数字证书概念贴](http://seanlook.com/2015/01/15/openssl-certificate-encryption/)

[自签名证书和私有CA签名的证书的区别 创建自签名证书 创建私有CA 证书类型 证书扩展名](http://blog.csdn.net/sdcxyz/article/details/47220129)

[那些证书相关的玩意儿(SSL,X.509,PEM,DER,CRT,CER,KEY,CSR,P12等)](http://www.cnblogs.com/guogangj/p/4118605.html)