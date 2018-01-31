## 文章导读

`cookie-parser`是Express的中间件，用来实现cookie的解析，是官方脚手架内置的中间件之一。

它的使用非常简单，但在使用过程中偶尔也会遇到问题。一般都是因为对`Express + cookie-parser`的签名、验证机制不了解导致的。

本文深入讲解`Express + cookie-parser`的签名和验证的实现机制，以及cookie签名是如何增强网站的安全性的。

## 入门例子：cookie设置与解析

先从最简单的例子来看下`cookie-parser`的使用，下面采用默认配置。

* cookie设置：使用`Express`的内置方法`res.cookie`。
* cookie解析：使用`cookie-parser`中间件。

```javascript
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

app.use(cookieParser());

app.use(function (req, res, next) {
  console.log(req.cookies.nick); // 第二次访问，输出chyingp
  next();
});

app.use(function (req, res, next) {  
  res.cookie('nick', 'chyingp');
  res.end('ok');
});

app.listen(3000);
```

在当前场景下，`cookie-parser`中间件大致实现如下：

```javascript
app.use(function (req, res, next) {
  req.cookies = cookie.parse(req.headers.cookie);
  next();
});
```

## 进阶例子：cookie签名与解析

出于安全的考虑，我们通常需要对cookie进行签名。

例子改写如下，有两个注意点：

1. `cookieParser`初始化时，传入`secret`作为签名的秘钥。
2. 设置cookie时，将`signed`设置为`true`，表示对cookie进行签名。
2. 获取cookie时，可以同时通过`req.cookies`，也可以通过`req.signedCookies`获取。

```javascript
var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();

// 初始化中间件，传入的第一个参数为singed secret
app.use(cookieParser('secret'));

app.use(function (req, res, next) {
  console.log(req.cookies.nick); // chyingp
  console.log(req.signedCookies.nick); // chyingp
  next();
});

app.use(function (req, res, next) {  
  // 传入第三个参数 {signed: true}，表示要对cookie进行摘要计算
  res.cookie('nick', 'chyingp', {signed: true});
  res.end('ok');
});

app.listen(3000);
```

签名前的cookie值为`chyingp`，签名后的cookie值为`s%3Achyingp.uVofnk6k%2B9mHQpdPlQeOfjM8B5oa6mppny9d%2BmG9rD0`。

下面就来分析下，cookie的签名、解析是如何实现的。

## cookie签名、解析实现剖析

Express完成cookie值的签名，`cookie-parser`实现签名cookie的解析。两者公用同一个秘钥。

### cookie签名

Express对cookie的设置（包括签名），都是通过`res.cookie`这个方法实现的。

精简后的代码如下：

```javascript
res.cookie = function (name, value, options) {  
  var secret = this.req.secret;
  var signed = opts.signed;

  // 如果 options.signed 为true，则对cookie进行签名
  if (signed) {
    val = 's:' + sign(val, secret);
  }

  this.append('Set-Cookie', cookie.serialize(name, String(val), opts));

  return this;
};
```

`sign`为签名函数。伪代码如下，其实就是把cookie的原始值，跟hmac后的值拼接起来。

>敲黑板划重点：签名后的cookie值，包含了原始值。

```javascript
function sign (val, secret) {
  return val + '.' + hmac(val, secret);
}
```

这里的`secret`哪来的呢？是`cookie-parser`初始化的时候传入的。如下伪代码所示：

```javascript
var cookieParser = function (secret) {
  return function (req, res, next) {
    req.secret = secret;
    // ...
    next();
  };
};

app.use(cookieParser('secret'));
```

### 签名cookie解析

知道了cookie签名的机制后，如何"解析"签名cookie就很清楚了。这个阶段，中间件主要做了两件事：

1. 将签名cookie对应的原始值提取出来
2. 验证签名cookie是否合法

实现代码如下：

```javascript
// str：签名后的cookie，比如 "s:chyingp.uVofnk6k+9mHQpdPlQeOfjM8B5oa6mppny9d+mG9rD0"
// secret：秘钥，比如 "secret"
function signedCookie(str, secret) {

  // 检查是否 s: 开头，确保只对签过名的cookie进行解析
  if (str.substr(0, 2) !== 's:') {
    return str;
  }

  // 校验签名的值是否合法，如合法，返回true，否则，返回false
  var val = unsign(str.slice(2), secret);
  
  if (val !== false) {
    return val;
  }

  return false;
}
```

判断、提取cookie原始值比较简单。只是是`unsign`方法名比较有迷惑性。

一般只会对签名进行合法校验，并没有所谓的反签名。

`unsign`方法的代码如下。首先，从传入的cookie值中，分别提取出原始值A1、签名值B1。用同样的秘钥对A1进行签名，得到A2。根据A2、B1是否相等，判断签名是否合法。

```javascript
exports.unsign = function(val, secret){
  var str = val.slice(0, val.lastIndexOf('.'))
    , mac = exports.sign(str, secret);
  
  return sha1(mac) == sha1(val) ? str : false;
};
```

## cookie签名的作用

主要是出于安全考虑，防止cookie被篡改，增强安全性。

举个小例子来看下cookie签名是如何实现防篡改的。

基于前面的例子展开。假设网站通过`nick`这个cookie来区分当前登录的用户是谁。在前面例子中，登录用户的cookie中，nick对应的值如下：(decode后的)

```
s:chyingp.uVofnk6k+9mHQpdPlQeOfjM8B5oa6mppny9d+mG9rD0
```

此时，有人试图修改这个cookie值，来达到伪造身份的目的。比如修改成`xiaoming`：

```
s:xiaoming.uVofnk6k+9mHQpdPlQeOfjM8B5oa6mppny9d+mG9rD0
```

当网站收到请求，对签名cookie进行解析，发现签名验证不通过。由此可判断，cookie是伪造的。

```
hmac("xiaoming", "secret") !== "uVofnk6k+9mHQpdPlQeOfjM8B5oa6mppny9d+mG9rD0"
```

## 签名就能够确保安全吗

当然不是。

上个小节的例子，仅通过`nick`这个cookie的值来判断登录的是哪个用户，这是一个非常糟糕的设计。虽然在秘钥未知的情况下，很难伪造签名cookie的，但原始值相同的情况下，签名也是相同的。这种情况下，其实是很容易伪造的。

另外，开源组件的算法是公开的，因此秘钥的安全性就成了关键，要确保秘钥不泄露。

还有很多，这里不展开。

## 小结

本文主要对`Express + cookie-parser`的签名和解析机制进行相对深入的介绍。不少类似的总结文章中，把cookie的签名说成了加密，这是一个常见的错误，读者朋友可以注意一下。

签名部分的介绍，稍微涉及一些简单的安全知识，对这块不熟悉的同学可以留言交流。为讲解方便，部分段落、用词可能不够严谨。如有错漏，敬请指出。

## 相关链接

https://github.com/expressjs/cookie-parser