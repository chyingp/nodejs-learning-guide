## 前言

在web服务端开发中，字符的编解码是几乎每天都要打交道的问题。在网络请求中，编解码一旦处理不当，就会出现令人头疼的乱码问题。

不少刚接触node服务开发的同学，由于对编码码相关知识了解不足，遇到问题时，经常会一筹莫展，花大量的时间在排查、解决问题。

文本就针对编解码的问题，提供一些参考思路。


## 关于字符编解码

网络在通信的过程中，传输的都是二进制的比特位，不管发送的内容是文本还是图片，采用的语言是中文还是英文。

举个例子，客户端向服务端发送"你好吗"。

>客户端 --- 你好 ---> 服务端

这中间包含了两个关键步骤，这两个步骤对应的分别就是编码、解码。

1. 客户端：将"你好"这个字符串，转成计算机网络需要的二进制比特位。
2. 服务端：将接收到的二进制比特位，还原成"你好"这个字符串。

总结一下：

1. 编码：将需要传送的数据，转成对应的二进制比特位。
2. 解码：将二进制比特位，转成原始的数据。

上面有个重要的技术细节没有提到，那就是字符怎么转成对应的二进制比特位的。

## 关于字符集

上面提到字符、二进制的转换问题。既然两者可以互相转换，也就是说应该存在明确的转换规则，可以实现**字符->二进制**、**二进制->字符**的相互转换。

上面提到的转换规则，其实就是我们经常听到的字符集，相当于一个映射表，里面定义了字符的编号。客户端、服务端就是根据这个映射表，来实现字符的编解码转换。

常见的字符集有ASCII、Unicode、GBK等。（Unicode最常见的实现方案就是UTF8）

需要注意的是，同一个字符，采用不同的字符集/编码方案，对应的编码可能是不同的。

举个例子，"你"这个字符，在UTF8编码中，占据三个字节`0xe4 0xbd 0xa0`，而在GBK编码中，占据两个字节`0xc4 0xe3`。

## 字符编解码例子

上面已经提到了字符集、字符编解码的基础知识，下面我们看一个简单的例子，这里借助了`icon-lite`这个库来帮助我们实现编解码的操作。

可以看到，在字符编码时，我们采用了`gbk`。在解码时，如果同样采用`gbk`，可以得到原始的字符。而当我们解码时采用`utf8`时，则出现了乱码。

```javascript
var iconv = require('iconv-lite');

var oriText = '你';

var encodedBuff = iconv.encode(oriText, 'gbk');
console.log(encodedBuff);
// <Buffer c4 e3>

var decodedText = iconv.decode(encodedBuff, 'gbk');
console.log(decodedText);
// 你

var wrongText = iconv.decode(encodedBuff, 'utf8');
console.log(wrongText);
// ��
```

## 服务端编解码例子

假设我们运行着node server，监听来自客户端的请求。客户端在传输数据的过程中，采用了`gbk`编码。服务端默认采用的是`utf8`编码，如果此时采用默认的`utf8`对请求进行解码，就会出现乱码。

此时需要特殊处理，服务端代码如下。注意，为简化代码，这里跳过了请求方法、请求编码的判断。

```javascript
var http = require('http');
var iconv = require('iconv-lite');

var server = http.createServer(function (req, res) {
    var chunks = [];
    
    req.on('data', function (chunk) {
        chunks.push(chunk)
    });

    req.on('end', function () {
        chunks = Buffer.concat(chunks);

        // 对二进制进行解码
        var body = iconv.decode(chunks, 'gbk');
        console.log(body);

        res.end('HELLO FROM SERVER');
    });

});

server.listen(3000);
```

对应的客户端代码如下：

```javascript
var http = require('http');
var iconv = require('iconv-lite');

var charset = 'gbk';

// 对字符"你"进行编码
var reqBuff = iconv.encode('你', charset);

var options = {
    hostname: '127.0.0.1',
    port: '3000',
    path: '/',
    method: 'POST',
    headers: {
        'Content-Type': 'text/plain',
        'Content-Encoding': 'identity',
        'Charset': charset // 设置请求字符集编码
    }
};

var client = http.request(options, function(res) {
    res.pipe(process.stdout);
});

client.end(reqBuff);
```

## 相关链接

https://github.com/ashtuchkin/iconv-lite