## 模块概览

nodejs的核心模块，基本上都是stream的的实例，比如process.stdout、http.clientRequest。

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

* http.IncomingRequest
* fs.createReadStream()
* process.stdin
* 其他

例子一：

```js
var fs = require('fs');

fs.readFile('./sample.txt', 'utf8', function(err, content){
	// 文件读取完成，文件内容是 [你好，我是程序猿小卡]
	console.log('文件读取完成，文件内容是 [%s]', content);
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
	// 文件读取完成，文件内容是 [你好，我是程序猿小卡]
	console.log('文件读取完成，文件内容是 [%s]', content);
});
```

例子三：

这里使用了`.pipe(dest)`，好处在于，如果源文件较大，对于降低内存占用有好处。

```js
var fs = require('fs');

fs.createReadStream('./sample.txt').pipe(process.stdout);
```

注意：这里只是原封不动的将内容输出到控制台，所以实际上跟前两个例子有细微差异。可以稍做修改，达到上面同样的效果

```js
var fs = require('fs');

var onEnd = function(){
	process.stdout.write(']');	
};

var fileStream = fs.createReadStream('./sample.txt');
fileStream.on('end', onEnd)

fileStream.pipe(process.stdout);

process.stdout.write('文件读取完成，文件内容是[');

// 文件读取完成，文件内容是[你好，我是程序猿小卡]
```

## Writable Stream

同样以写文件为例子，比如想将`hello world`写到`sample.txt`里。

例子一：

```js
var fs = require('fs');
var content = 'hello world';
var filepath = './sample.txt';

fs.writeFile(filepath, content);
```

例子二：

```js
var fs = require('fs');
var content = 'hello world';
var filepath = './sample.txt';

var writeStram = fs.createWriteStream(filepath);
writeStram.write(content);
writeStram.end();
```

## Duplex Stream

最常见的Duplex stream应该就是`net.Socket`实例了，在前面的文章里有接触过，这里就直接上代码了，这里包含服务端代码、客户端代码。

服务端代码：

```js
var net = require('net');
var opt = {
	host: '127.0.0.1',
	port: '3000'
};

var server = net.createServer((socket) => {
    socket.on('data', (data) => {
        console.log('client send message: ', data.toString());
    });
    socket.write('hello client');
});
server.listen(opt.port, opt.host, ()=>{
    console.log(server.address());
});
```

客户端代码：

```js
var net = require('net');
var opt = {
	host: '127.0.0.1',
	port: '3000'
};

var client = net.connect(opt, function(){
	client.write('msg from client');  // 可写
});

// 可读
client.on('data', function(data){
    // lient: got reply from server [reply from server]
	console.log('client: got reply from server [%s]', data);
	client.end();
});
```

## Transform Stream

Transform stream是Duplex stream的特例，也就是说，Transform stream也同时可读可写。跟Duplex stream的区别点在于，Transform stream的输出与输入是存在相关性的。

常见的Transform stream包括`zlib`、`crypto`，这里举个简单例子：文件的gzip压缩。

```js
var fs = require('fs');
var zlib = require('zlib');

var gzip = zlib.createGzip();

var inFile = fs.createReadStream('./extra/fileForCompress.txt');
var out = fs.createWriteStream('./extra/fileForCompress.txt.gz');

inFile.pipe(gzip).pipe(out);
```

## 相关链接

https://nodejs.org/api/stream.html
