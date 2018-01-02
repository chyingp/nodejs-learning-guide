# Nodejs进阶：crypto模块之理论篇

## 一、 文章概述

互联网时代，网络上的数据量每天都在以惊人的速度增长。同时，各类网络安全问题层出不穷。在信息安全重要性日益凸显的今天，作为一名开发者，需要加强对安全的认识，并通过技术手段增强服务的安全性。

`crypto`模块是nodejs的核心模块之一，它提供了安全相关的功能，如摘要运算、加密、电子签名等。很多初学者对着长长的API列表，不知如何上手，因此它背后涉及了大量安全领域的知识。

本文重点讲解API背后的理论知识，主要包括如下内容：

1. 摘要（hash）、基于摘要的消息验证码（HMAC）
2. 对称加密、非对称加密、电子签名
3. 分组加密模式

## 二、摘要（hash）

摘要（digest）：将长度不固定的消息作为输入，通过运行hash函数，生成固定长度的输出，这段输出就叫做摘要。通常用来验证消息完整、未被篡改。

摘要运算是不可逆的。也就是说，输入固定的情况下，产生固定的输出。但知道输出的情况下，无法反推出输入。

伪代码如下。

> digest = Hash(message)

常见的摘要算法 与 对应的输出位数如下：

* MD5：128位
* SHA-1：160位
* SHA256 ：256位
* SHA512：512位

nodejs中的例子：

```javascript
var crypto = require('crypto');
var md5 = crypto.createHash('md5');

var message = 'hello';
var digest = md5.update(message, 'utf8').digest('hex'); 

console.log(digest);
// 输出如下：注意这里是16进制
// 5d41402abc4b2a76b9719d911017c592
```

>备注：在各类文章或文献中，摘要、hash、散列 这几个词经常会混用，导致不少初学者看了一脸懵逼，其实大部分时候指的都是一回事，记住上面对摘要的定义就好了。

## 三、MAC、HMAC

MAC（Message Authentication Code）：消息认证码，用以保证数据的完整性。运算结果取决于消息本身、秘钥。

MAC可以有多种不同的实现方式，比如HMAC。

HMAC（Hash-based Message Authentication Code）：可以粗略地理解为带秘钥的hash函数。

nodejs例子如下：

```javascript
const crypto = require('crypto');

// 参数一：摘要函数
// 参数二：秘钥
let hmac = crypto.createHmac('md5', '123456');
let ret = hmac.update('hello').digest('hex');

console.log(ret);
// 9c699d7af73a49247a239cb0dd2f8139
```

## 四、对称加密、非对称加密

**加密/解密**：给定明文，通过一定的算法，产生加密后的密文，这个过程叫加密。反过来就是解密。

>encryptedText = encrypt( plainText )
>plainText = decrypt( encryptedText )

**秘钥**：为了进一步增强加/解密算法的安全性，在加/解密的过程中引入了秘钥。秘钥可以视为加/解密算法的参数，在已知密文的情况下，如果不知道解密所用的秘钥，则无法将密文解开。

>encryptedText = encrypt(plainText, encryptKey)
>plainText = decrypt(encryptedText, decryptKey)

根据加密、解密所用的秘钥是否相同，可以将加密算法分为**对称加密**、**非对称加密**。

### 1、对称加密

加密、解密所用的秘钥是相同的，即`encryptKey === decryptKey`。

常见的对称加密算法：DES、3DES、AES、Blowfish、RC5、IDEA。

加、解密伪代码：

>encryptedText = encrypt(plainText, key); // 加密
>plainText = decrypt(encryptedText, key); // 解密

### 2、非对称加密

又称公开秘钥加密。加密、解密所用的秘钥是不同的，即`encryptKey !== decryptKey`。

加密秘钥公开，称为公钥。解密秘钥保密，称为秘钥。

常见的非对称加密算法：RSA、DSA、ElGamal。

加、解密伪代码：

>encryptedText = encrypt(plainText, publicKey); // 加密
>plainText = decrypt(encryptedText, priviteKey); // 解密
 

### 3、对比与应用

除了秘钥的差异，还有运算速度上的差异。通常来说：

1. 对称加密速度要快于非对称加密。
2. 非对称加密通常用于加密短文本，对称加密通常用于加密长文本。

两者可以结合起来使用，比如HTTPS协议，可以在握手阶段，通过RSA来交换生成对称秘钥。在之后的通讯阶段，可以使用对称加密算法对数据进行加密，秘钥则是握手阶段生成的。 

>备注：对称秘钥交换不一定通过RSA，还可以通过类似DH来完成，这里不展开。

## 五、数字签名

从**签名**大致可以猜到**数字签名**的用途。主要作用如下：

1. 确认信息来源于特定的主体。
2. 确认信息完整、未被篡改。

为了达到上述目的，需要有两个过程：

1. 发送方：生成签名。
2. 接收方：验证签名。

### 1、发送方生成签名

1. 计算原始信息的摘要。
2. 通过私钥对摘要进行签名，得到电子签名。
3. 将原始信息、电子签名，发送给接收方。

附：签名伪代码

>digest = hash(message); // 计算摘要
>digitalSignature = sign(digest,  priviteKey); // 计算数字签名

### 2、接收方验证签名

1. 通过公钥解开电子签名，得到摘要D1。（如果解不开，信息来源主体校验失败）
2. 计算原始信息的摘要D2。
3. 对比D1、D2，如果D1等于D2，说明原始信息完整、未被篡改。

附：签名验证伪代码

>digest1 = verify(digitalSignature, publicKey); // 获取摘要
>digest2 = hash(message); // 计算原始信息的摘要
>digest1 === digest2 // 验证是否相等

### 3、对比非对称加密

由于RSA算法的特殊性，加密/解密、签名/验证 看上去特别像，很多同学都很容易混淆。先记住下面结论，后面有时间再详细介绍。

1. 加密/解密：公钥加密，私钥解密。
2. 签名/验证：私钥签名，公钥验证。

## 六、分组加密模式、填充、初始化向量

常见的对称加密算法，如AES、DES都采用了分组加密模式。这其中，有三个关键的概念需要掌握：模式、填充、初始化向量。

搞清楚这三点，才会知道crypto模块对称加密API的参数代表什么含义，出了错知道如何去排查。

### 1、分组加密模式

所谓的分组加密，就是将（较长的）明文拆分成固定长度的块，然后对拆分的块按照特定的模式进行加密。

常见的分组加密模式有：ECB（不安全）、CBC（最常用）、CFB、OFB、CTR等。

以最简单的ECB为例，先将消息拆分成等分的模块，然后利用秘钥进行加密。

![Alt text](./1514888679104.png)

图片来源：[这里](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Electronic_Codebook_%28ECB%29)，更多关于分组加密模式的介绍可以参考 [wiki](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Common_modes)。

>后面假设每个块的长度为128位

### 2、初始化向量：IV

为了增强算法的安全性，部分分组加密模式（CFB、OFB、CTR）中引入了初始化向量（IV），使得加密的结果随机化。也就是说，对于同一段明文，IV不同，加密的结果不同。

以CBC为例，每一个数据块，都与前一个加密块进行亦或运算后，再进行加密。对于第一个数据块，则是与IV进行亦或。

IV的大小跟数据块的大小有关（128位），跟秘钥的长度无关。

如图所示，图片来源 [这里](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation#Cipher_Block_Chaining_%28CBC%29)

![Alt text](./1514892463299.png)


### 3、填充：padding

分组加密模式需要对长度固定的块进行加密。分组拆分完后，最后一个数据块长度可能小于128位，此时需要进行填充以满足长度要求。

填充方式有多重。常见的填充方式有[PKCS7](https://tools.ietf.org/html/rfc5652#section-6.3)。

假设分组长度为k字节，最后一个分组长度为k-last，可以看到：

1. 不管明文长度是多少，加密之前都会会对明文进行填充 （不然解密函数无法区分最后一个分组是否被填充了，因为存在最后一个分组长度刚好等于k的情况）
2. 如果最后一个分组长度等于k-last === k，那么填充内容为一个完整的分组 k k k ... k （k个字节）
3. 如果最后一个分组长度小于k-last < k，那么填充内容为 k-last mod k 

```
                     01 -- if lth mod k = k-1
                  02 02 -- if lth mod k = k-2
                      .
                      .
                      .
            k k ... k k -- if lth mod k = 0
```

### 概括来说

1. 分组加密：先将明文切分成固定长度的块（128位），再进行加密。
2. 分组加密的几种模式：ECB（不安全）、CBC（最常用）、CFB、OFB、CTR。
3. 填充(padding)：部分加密模式，当最后一个块的长度小于128位时，需要通过特定的方式进行填充。（ECB、CBC需要填充，CFB、OFB、CTR不需要填充）
4. 初始化向量（IV）：部分加密模式（CFB、OFB、CTR）会将 明文块 与 前一个密文块进行亦或操作。对于第一个明文块，不存在前一个密文块，因此需要提供初始化向量IV（把IV当做第一个明文块 之前的 密文块）。此外，IV也可以让加密结果随机化。

## 七、写在后面

crypto模块涉及的安全知识较多，篇幅所限，这里没办法一一展开。为了讲解方便，部分内容可能不够严谨，如有错漏敬请指出。

有疑问或感兴趣的同学欢迎留言交流，也可留意我的github关注最新内容更新[《nodejs-learning-guide》](https://github.com/chyingp/nodejs-learning-guide)。

## 八、相关链接

[Nodejs学习笔记](https://github.com/chyingp/nodejs-learning-guide)

[Cryptographic hash function](https://en.wikipedia.org/wiki/Cryptographic_hash_function)

[Hash-based message authentication code](https://en.wikipedia.org/wiki/Hash-based_message_authentication_code)

[HMAC vs MAC functions](https://crypto.stackexchange.com/questions/2936/hmac-vs-mac-functions)

[What is the difference between MAC and HMAC?](https://crypto.stackexchange.com/questions/6523/what-is-the-difference-between-mac-and-hmac)

[Block cipher mode of operation](https://en.wikipedia.org/wiki/Block_cipher_mode_of_operation)

[RSA的公钥和私钥到底哪个才是用来加密和哪个用来解密？ - 刘巍然-学酥的回答 - 知乎](https://www.zhihu.com/question/25912483/answer/31653639)

