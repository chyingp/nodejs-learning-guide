## 简介

MD5（Message-Digest Algorithm）是计算机安全领域广泛使用的散列函数（又称哈希算法、摘要算法），主要用来确保消息的完整和一致性。常见的应用场景有密码保护、下载文件校验等。

## 特点

1. 运算速度快
2. 输出长度固定：输入长度不固定，输出长度固定（128位）。
3. 运算不可逆：已知运算结果的情况下，无法通过通过逆运算得到原始字符串。
4. 高度离散：输入的微小变化，可导致运算结果差异巨大。
5. 弱碰撞性：不同输入的散列值可能相同。

## 应用场景

1. 文件完整性校验：比如从网上下载一个软件，一般网站都会将软件的md5值附在网页上，用户下载完软件后，可对下载到本地的软件进行md5运算，然后跟网站上的md5值进行对比，确保下载的软件是完整的（或正确的）
2. 密码保护：将md5后的密码保存到数据库，而不是保存明文密码，避免拖库等事件发生后，明文密码外泄。当然只是简单的md5计算，安全性也是不够的。
3. 防篡改：比如数字证书的防篡改，就用到了摘要算法。（当然还要结合数字签名等手段）

## nodejs中进行md5

在nodejs中，`crypto`模块封装了一系列密码学相关的功能，包括摘要运算。基础例子如下，非常简单：

```js
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

var result = md5.update('a').digest('base64');

// 输出：DMF1ucDxtqgxw5niaXcmYQ==
console.log(result);
```

## 例子：密码保护

前面提到，将明文密码保存到数据库是很不安全的，最不济也要进行md5后进行保存。比如用户密码是`123456`，md5运行后，得到`4QrcOUm6Wau+VuBX8g+IPg==`。

这样至少有两个好处：

1. 防内部攻击：网站也不知道用户的明文密码，避免网站主人拿着用户明文密码干坏事。
2. 防外部攻击：如网站被黑客入侵，黑客也只能拿到md5后的密码，而不是用户的明文密码。

示例代码如下：

```javascript
var crypto = require('crypto');

function cryptPwd(password) {
    var md5 = crypto.createHash('md5');
    return md5.update(password).digest('base64');
}

var password = '123456';
var cryptedPassword = cryptPwd(password);

console.log(cryptedPassword);
// 输出：e10adc3949ba59abbe56e057f20f883e
```

## 密码加盐

### 为什么单纯md5不安全

前面提到，通过对用户密码进行md5运算来提高安全性。但实际上，这样的安全性是很差的，为什么呢？

稍微修改下上面的例子，可能你就明白了。同样的明文密码，md5后输出的值是固定的。

也就是说，当我知道算法是md5，且hash值为`e10adc3949ba59abbe56e057f20f883e`时，理论上我可以猜测，用户的密码就是`123456`。

事实上，彩虹表就是这么进行暴力破解的，事先将常见明文密码的md5值运算好存起来，然后将用户明文密码的md5值，跟数据库里的 明文密码/摘要 进行比对，就能够快速找到用户的明文密码。

```javascript
var crypto = require('crypto');

function cryptPwd(password) {
    var md5 = crypto.createHash('md5');
    return md5.update(password).digest('base64');
}

var password = '123456';

console.log( cryptPwd(password) );
// 输出：e10adc3949ba59abbe56e057f20f883e

console.log( cryptPwd(password) );
// 输出：e10adc3949ba59abbe56e057f20f883e
```

### 密码加盐

那么，有什么办法可以进一步提升安全性呢？答案是：密码加盐。

“加盐”这个词看上去很玄乎，其实原理很简单，就是在密码特定位置插入特定字符串后，再对修改后的字符串进行md5运算。



## 相关链接

MD5碰撞的一些例子
http://www.jianshu.com/p/c9089fd5b1ba

MD5 Collision Demo
http://www.mscs.dal.ca/~selinger/md5collision/

Free Password Hash Cracker
https://crackstation.net/
