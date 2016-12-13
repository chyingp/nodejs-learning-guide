## hash例子

hash.digest([encoding])：计算摘要。encoding可以是`hex`、`latin1`或者`base64`。如果声明了encoding，那么返回字符串。否则，返回Buffer实例。注意，调用hash.digest()后，hash对象就作废了，再次调用就会出错。

hash.update(data[, input_encoding])：input_encoding可以是`utf8`、`ascii`或者`latin1`。如果data是字符串，且没有指定 input_encoding，则默认是`utf8`。注意，hash.update()方法可以调用多次。

```js
var crypto = require('crypto');
var fs = require('fs');

var content = fs.readFileSync('./test.txt', {encoding: 'utf8'});
var hash = crypto.createHash('sha256');
var output;

hash.update(content);

output = hash.digest('hex'); 

console.log(output);
// 输出内容为：
// b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
```

也可以这样：

```js
var crypto = require('crypto');
var fs = require('fs');

var input = fs.createReadStream('./test.txt', {encoding: 'utf8'});
var hash = crypto.createHash('sha256');

hash.setEncoding('hex');

input.pipe(hash).pipe(process.stdout)

// 输出内容为：
// b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9
```

hash.digest()后，再次调用digest()或者update()

```js
var crypto = require('crypto');
var fs = require('fs');

var content = fs.readFileSync('./test.txt', {encoding: 'utf8'});
var hash = crypto.createHash('sha256');
var output;

hash.update(content);
hash.digest('hex'); 

// 报错：Error: Digest already called
hash.update(content);

// 报错：Error: Digest already called
hash.digest('hex');
```

## HMAC例子

HMAC的全称是Hash-based Message Authentication Code，也即在hash的加盐运算。

算法细节可以参考附录链接，具体到使用的话，跟hash模块差不多，选定hash算法，指定“盐”即可。

例子1：

```js
var crypto = require('crypto');
var fs = require('fs');

var secret = 'secret';
var hmac = crypto.createHmac('sha256', secret);
var input = fs.readFileSync('./test.txt', {encoding: 'utf8'});

hmac.update(input);

console.log( hmac.digest('hex') );
// 输出：
// 734cc62f32841568f45715aeb9f4d7891324e6d948e4c6c60c0621cdac48623a
```

例子2：

```js
var crypto = require('crypto');
var fs = require('fs');

var secret = 'secret';
var hmac = crypto.createHmac('sha256', secret);
var input = fs.createReadStream('./test.txt', {encoding: 'utf8'});

hmac.setEncoding('hex');

input.pipe(hmac).pipe(process.stdout)
// 输出：
// 734cc62f32841568f45715aeb9f4d7891324e6d948e4c6c60c0621cdac48623a
```

## 关键点

md5：固定长度（128bit）、不可逆（重要）、不同数据的散列值可能相同（重要）、高度离散型（原文细微的变化，会导致散列值差异巨大）



sha1：固定长度160bit，广泛使用（如TLS，目前安全性受到密码学家的质疑）

SHA-256/SHA-384/SHA-512：后面表示摘要的长度。

用途：数字签名、文件完整性校验

关系：sha1 基于 MD5，MD5 基于 MD4

md5(1991) -> SHA1

sha家族：由美国国家安全局（NSA）所设计，并由美国国家标准与技术研究院（NIST）发布；是美国的政府标准。



## 相关术语

MD5：Message-Digest Algorithm 5，信息-摘要算法。

SHA：Secure Hash Algorithm，安全散列算法。

HMAC：Hash-based Message Authentication Code，密钥相关的哈希运算消息认证码。

SPKAC：

## 相关链接

字符编码笔记：ASCII，Unicode和UTF-8 - 阮一峰的网络日志
http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html

Unicode与JavaScript详解
http://www.ruanyifeng.com/blog/2014/12/unicode.html

Base64笔记
http://www.ruanyifeng.com/blog/2008/06/base64.html

MIME笔记
http://www.ruanyifeng.com/blog/2008/06/mime.html

SHA家族
https://zh.wikipedia.org/wiki/SHA%E5%AE%B6%E6%97%8F

加盐密码哈希：如何正确使用
http://blog.jobbole.com/61872/

HMAC-MD5算法原理及实现
http://www.jianshu.com/p/067f9eb6b252