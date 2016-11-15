## 问题：将图片转成datauri

今天，在QQ群有个群友问了个问题：“nodejs读取图片，转成base64，怎么读取呢？” 想了一下，他想问的应该是 怎么样把图片嵌入到网页中去，即如何把图片转成对应的 datauri。

是个不错的问题，而且也是个很常用的功能。快速实现了个简单的demo，这里顺便记录一下。

## 实现思路

思路很直观：1、读取图片二进制数据 -> 2、转成base64字符串 -> 3、转成datauri。

关于base64的介绍，可以参考阮一峰老师的[文章](http://www.ruanyifeng.com/blog/2008/06/base64.html)。而 datauri 的格式如下

>data:[<mediatype>][;base64],<data>

具体到png图片，大概如下，其中 “xxx” 就是前面的base64字符串了。接下来，我们看下在nodejs里该如何实现

>data: image/png;base64, xxx

## 具体实现

首先，读取本地图片二进制数据。

```js
var fs = require('fs');
var filepath = './1.png';

var bData = fs.readFileSync(filepath);
```

然后，将二进制数据转换成base64编码的字符串。

```js
var base64Str = bData.toString('base64');
```

最后，转换成datauri的格式。

```js
var datauri = 'data:image/png;base64,' + base64Str;
```

完整例子代码如下，代码非常少：

```js
var fs = require('fs');
var filepath = './1.png';

var bData = fs.readFileSync(filepath);
var base64Str = bData.toString('base64');
var datauri = 'data:image/png;base64,' + base64Str;

console.log(datauri);
```

## github demo地址

demo地址请[点击这里](https://github.com/chyingp/nodejs-learning-guide/tree/master/examples/2016.11.15-base64-datauri)，或者

```bash
git clone https://github.com/chyingp/nodejs-learning-guide.git
cd nodejs-learning-guide/examples/2016.11.15-base64-datauri
node server.js
```

然后在浏览器访问 [http://127.0.0.1:3000](http://127.0.0.1:3000)，就可以看到效果 :)

## 相关链接

Base64笔记：http://www.ruanyifeng.com/blog/2008/06/base64.html
Data URIs：https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs