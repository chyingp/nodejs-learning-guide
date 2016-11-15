## 概览

早上有个小伙伴在群里，怎么把图片转成

## 字符串转成base64

## 图片信息转成base64

首先，通过 fs.readFileSync(filepath) 获取图片的二进制数据。然后通过 .toString('base64') 转成base64编码。

```js
var fs = require('fs');
var filepath = './1.png';

var bData = fs.readFileSync(filepath);
var result = bData.toString('base64');
```

结果有点长，这里就不贴了。

## 中文转成base64

比如说，要把 严 转成base64。

utf8 -> 二进制 -> base64

首先，把utf8编码的 严 转成 2进制

```js
var bData = Buffer.from('严', 'utf8');
```

然后，把二进制转成 base64

```js
var result = bData.toString('base64');
```

结果为 5Lil。