## 简介

Diffie-Hellman（简称DH）是密钥交换算法之一，它的作用是保证通信双方在非安全的信道中安全地交换密钥。目前DH最重要的应用场景之一，就是在HTTPS的握手阶段，客户端、服务端利用DH算法交换对称密钥。

下面会先简单介绍DH的数理基础，然后举例说明如何在nodejs中使用DH相关的API。

## 数论基础

要理解DH算法，需要掌握一定的数论基础。感兴趣的可以进一步研究推导过程，或者直接记住下面结论，然后进入下一节。

1. 假设 Y = a^X mod p，已知X的情况下，很容易算出Y；已知道Y的情况下，很难算出X；
2. (a^Xa mod p)^Xb mod p = a^(Xa * Xb) mod p

## 握手步骤说明

假设客户端、服务端挑选两个素数a、p（都公开），然后

* 客户端：选择自然数Xa，Ya = a^Xa mod p，并将Ya发送给服务端；
* 服务端：选择自然数Xb，Yb = a^Xb mod p，并将Yb发送给客户端；
* 客户端：计算 Ka = Yb^Xa mod p
* 服务端：计算 Kb = Ya^Xb mod p

>Ka = Yb^Xa mod p 
    = (a^Xb mod p)^Xa mod p 
    = a^(Xb * Xa) mod p
    = (a^Xa mod p)^Xb mod p
    = Ya^Xb mod p
    = Kb

可以看到，尽管客户端、服务端彼此不知道对方的Xa、Xb，但算出了相等的secret。

## Nodejs代码示例

结合前面小结的介绍来看下面代码，其中，要点之一就是client、server采用相同的素数a、p。

```javascript
var crypto = require('crypto');

var primeLength = 1024;  // 素数p的长度
var generator = 5;  // 素数a

// 创建客户端的DH实例
var client = crypto.createDiffieHellman(primeLength, generator);
// 产生公、私钥对，Ya = a^Xa mod p
var clientKey = client.generateKeys();

// 创建服务端的DH实例，采用跟客户端相同的素数a、p
var server = crypto.createDiffieHellman(client.getPrime(), client.getGenerator());
// 产生公、私钥对，Yb = a^Xb mod p
var serverKey = server.generateKeys();

// 计算 Ka = Yb^Xa mod p
var clientSecret = client.computeSecret(server.getPublicKey());
// 计算 Kb = Ya^Xb mod p
var serverSecret = server.computeSecret(client.getPublicKey());

// 由于素数p是动态生成的，所以每次打印都不一样
// 但是 clientSecret === serverSecret
console.log(clientSecret.toString('hex'));
console.log(serverSecret.toString('hex'));
```

## 相关链接

[理解 Deffie-Hellman 密钥交换算法](http://wsfdl.com/algorithm/2016/02/04/%E7%90%86%E8%A7%A3Diffie-Hellman%E5%AF%86%E9%92%A5%E4%BA%A4%E6%8D%A2%E7%AE%97%E6%B3%95.html)

[迪菲-赫尔曼密钥交换](https://zh.wikipedia.org/zh-cn/%E8%BF%AA%E8%8F%B2-%E8%B5%AB%E7%88%BE%E6%9B%BC%E5%AF%86%E9%91%B0%E4%BA%A4%E6%8F%9B)

[Secure messages in NodeJSusing ECDH](https://cafedev.org/article/2016/11/secure-messages-in-nodejs-using-ecdh/)

[Keyless SSL: The Nitty Gritty Technical Details](https://blog.cloudflare.com/keyless-ssl-the-nitty-gritty-technical-details/)