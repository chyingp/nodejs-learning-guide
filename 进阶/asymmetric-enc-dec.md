## 前言

刚回答了SegmentFault上一个兄弟提的问题[《非对称解密出错》](https://segmentfault.com/q/1010000013016668/a-1020000013017090 "《非对称解密出错》")。这个属于Node.js在安全上的应用，遇到同样问题的人应该不少，基于回答的问题，这里简单总结下。

非对称加密的理论知识，可以参考笔者前面的文章[《NODEJS进阶：CRYPTO模块之理论篇》](https://www.chyingp.com/nodejs%E8%BF%9B%E9%98%B6%EF%BC%9Acrypto%E6%A8%A1%E5%9D%97%E4%B9%8B%E7%90%86%E8%AE%BA%E7%AF%87/ "《NODEJS进阶：CRYPTO模块之理论篇》")。

完整的代码可以在 [《Nodejs学习笔记》](https://github.com/chyingp/nodejs-learning-guide "这里") 找到，也欢迎大家关注 [程序猿小卡的GitHub](https://github.com/chyingp "gayhub")。

## 加密、解密方法

在Node.js中，负责安全的模块是`crypto`。非对称加密中，公钥加密，私钥解密，加解密对应的API分别如下。

加密函数：

```javascript
crypto.publicEncrypt(key, buffer)
```

解密函数：

```javascript
crypto.privateDecrypt(privateKey, buffer)
```

## 入门例子

假设有如下`utils.js`

```javascript
// utils.js
const crypto = require('crypto');

// 加密方法
exports.encrypt = (data, key) => {
  // 注意，第二个参数是Buffer类型
  return crypto.publicEncrypt(key, Buffer.from(data));
};

// 解密方法
exports.decrypt = (encrypted, key) => {
  // 注意，encrypted是Buffer类型
  return crypto.privateDecrypt(key, encrypted);
};
```

测试代码`app.js`：

```javascript
const utils = require('./utils');
const keys = require('./keys');

const plainText = '你好，我是程序猿小卡';
const crypted = utils.encrypt(plainText, keys.pubKey); // 加密
const decrypted = utils.decrypt(crypted, keys.privKey); // 解密

console.log(decrypted.toString()); // 你好，我是程序猿小卡
```

附上公钥、私钥 `keys.js`：

```javascript
exports.privKey = `-----BEGIN RSA PRIVATE KEY-----
MIICXQIBAAKBgQDFWnl8fChyKI/Tgo1ILB+IlGr8ZECKnnO8XRDwttBbf5EmG0qV
8gs0aGkh649rb75I+tMu2JSNuVj61CncL/7Ct2kAZ6CZZo1vYgtzhlFnxd4V7Ra+
aIwLZaXT/h3eE+/cFsL4VAJI5wXh4Mq4Vtu7uEjeogAOgXACaIqiFyrk3wIDAQAB
AoGBAKdrunYlqfY2fNUVAqAAdnvaVOxqa+psw4g/d3iNzjJhBRTLwDl2TZUXImEZ
QeEFueqVhoROTa/xVg/r3tshiD/QC71EfmPVBjBQJJIvJUbjtZJ/O+L2WxqzSvqe
wzYaTm6Te3kZeG/cULNMIL+xU7XsUmslbGPAurYmHA1jNKFpAkEA48aUogSv8VFn
R2QuYmilz20LkCzffK2aq2+9iSz1ZjCvo+iuFt71Y3+etWomzcZCuJ5sn0w7lcSx
nqyzCFDspQJBAN3O2VdQF3gua0Q5VHmK9AvsoXLmCfRa1RiKuFOtrtC609RfX4DC
FxDxH09UVu/8Hmdau8t6OFExcBriIYJQwDMCQQCZLjFDDHfuiFo2js8K62mnJ6SB
H0xlIrND2+/RUuTuBov4ZUC+rM7GTUtEodDazhyM4C4Yq0HfJNp25Zm5XALpAkBG
atLpO04YI3R+dkzxQUH1PyyKU6m5X9TjM7cNKcikD4wMkjK5p+S2xjYQc1AeZEYq
vc187dJPRIi4oC3PN1+tAkBuW51/5vBj+zmd73mVcTt28OmSKOX6kU29F0lvEh8I
oHiLOo285vG5ZtmXiY58tAiPVQXa7eU8hPQHTHWa9qp6
-----END RSA PRIVATE KEY-----
`;

exports.pubKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDFWnl8fChyKI/Tgo1ILB+IlGr8
ZECKnnO8XRDwttBbf5EmG0qV8gs0aGkh649rb75I+tMu2JSNuVj61CncL/7Ct2kA
Z6CZZo1vYgtzhlFnxd4V7Ra+aIwLZaXT/h3eE+/cFsL4VAJI5wXh4Mq4Vtu7uEje
ogAOgXACaIqiFyrk3wIDAQAB
-----END PUBLIC KEY-----
`;
```

## 小结

可以看到，通过Node.js进行非对称加密、解密还是挺方便的。更多用法，可以参考官方文档。

## 相关链接

[程序猿小卡的GitHub](https://github.com/chyingp "程序猿小卡的GitHub")

[Nodejs学习笔记](https://github.com/chyingp/nodejs-learning-guide "Nodejs学习笔记")

[非对称解密出错](https://segmentfault.com/q/1010000013016668/a-1020000013017090 "非对称解密出错")

[https://nodejs.org/api/crypto.html](https://nodejs.org/api/crypto.html)