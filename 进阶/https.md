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


## 服务器：自签名证书

```bash
➜  server git:(master) ✗ mkdir cert
➜  server git:(master) ✗ cd cert 
➜  cert git:(master) ✗ openssl genrsa -out chyingp-key.pem 2048
Generating RSA private key, 2048 bit long modulus
.............................+++
..........................................+++
e is 65537 (0x10001)
➜  cert git:(master) ✗ openssl req -new -sha256 -key chyingp-key.pem -out chyingp-csr.pem
You are about to be asked to enter information that will be incorporated
into your certificate request.
What you are about to enter is what is called a Distinguished Name or a DN.
There are quite a few fields but you can leave some blank
For some fields there will be a default value,
If you enter '.', the field will be left blank.
-----
Country Name (2 letter code) [AU]:CN
State or Province Name (full name) [Some-State]:Guangdong
Locality Name (eg, city) []:Shenzhen
Organization Name (eg, company) [Internet Widgits Pty Ltd]:YH
Organizational Unit Name (eg, section) []:web
Common Name (e.g. server FQDN or YOUR name) []:www.chyingp.com
Email Address []:416394284@qq.com

Please enter the following 'extra' attributes
to be sent with your certificate request
A challenge password []:123456
An optional company name []:YH
➜  cert git:(master) ✗ openssl x509 -req -in chyingp-csr.pem -signkey chyingp-key.pem -out chyingp-cert.pem
```


## 私有CA签名的证书

首先，创建自签名的CA证书

```bash
# 创建ca的私钥
openssl genrsa -out my-ca.key.pem 2048

# 创建ca的证书
openssl req \
  -x509 \
  -new \
  -nodes \
  -key my-ca.key.pem \
  -days 1024 \
  -out my-ca.crt.pem \
  -subj "/C=CN/ST=Guandong/L=Shenzhen/O=YH Inc/CN=chyingp.com"
```

然后，创建用CA的私钥进行签名的网站证书

```bash
# 创建私钥
openssl genrsa \
  -out my-server.key.pem \
  2048  

# 创建证书签名请求
openssl req -new \
  -key my-server.key.pem \
  -out my-server.csr.pem \
  -subj "/C=CN/ST=Guandong/L=Shenzhen/O=YH Inc/CN=www.chyingp.com"

# 创建网站证书
openssl x509 \
  -req -in my-server.csr.pem \
  -CA my-ca.crt.pem \
  -CAkey my-ca.key.pem \
  -CAcreateserial \
  -out my-server.crt.pem \
  -days 500  
```