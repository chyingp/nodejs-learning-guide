## 模块概览

nodejs的核心模块，基本上所有的核心模块都是stream的的实例，比如process.stdout、http.clientRequest。

对于大部分的nodejs开发者来说，平常并不会直接用到stream模块，只需要了解stream的运行机制即可（非常重要）。

而对于想要实现自定义stream实例的开发者来说，就得好好研究stream的扩展API了，比如gulp的内部实现就大量用到了自定义的stream类型。

来个简单的例子镇楼，几行代码就实现了读取文件内容，并打印到控制台：

```js
const fs = require('fs');

fs.createReadStream('./sample.txt').pipe(process.stdout);
```

## Stream分类

在nodejs中，有四种stream类型：

* Readable：用来读取数据，比如 `fs.createReadStream()`。
* Writable：用来写数据，比如 `fs.createWriteStream()`。
* Duplex：可读+可写，比如 `net.Socket()`。
* Transform：在读写的过程中，可以对数据进行修改，比如 `zlib.createDeflate()`（数据压缩/解压）。

## Readable Stream

以下都是nodejs中常见的Readable Stream，当然还有其他的，可自行查看文档。

* http.ServerResponse
* http.IncomingRequest
* fs.createReadStream()
* process.stdin
* 其他

例子一：

```js
var fs = require('fs');

fs.readFile('./sample.txt', 'utf8', function(err, content){
    console.log('文件读取完成，文件内容是\n[%s]', content);
});
```

例子二：

```js
var fs = require('fs');

var readStream = fs.createReadStream('./sample.txt');
var content = '';

readStream.setEncoding('utf8');

readStream.on('data', function(chunk){
    content += chunk;
});

readStream.on('end', function(chunk){
    console.log('文件读取完成，文件内容是\n[%s]', content);
});
```

例子三：

注意：这里的输出跟前面两个例子有细微的差异。

```js
var fs = require('fs');

fs.createReadStream('./sample.txt').pipe(process.stdout);
```

## Write Stream

## Duplex Stream

## Transform Stream

## 自定义Stream

## 相关链接

https://nodejs.org/api/stream.html