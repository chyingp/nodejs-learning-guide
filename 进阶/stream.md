类型：
自定义 ReadStream
自定义 WriteStream
自定义 DuplexStream
自定义 TransformStrem

模式对比：
string/buffer
object mode 


缓存：(buffering、highWaterMark)

两种视角：
stream使用
stream实现


## Readable Stream

可以通过两种方式从一个Readable Steram中读取数据：

1. none-flowing：默认
2. flowing

### none-flowing mode

以下代码从标准输入中读取内容，并写回到标准输出。

1. read()方法是同步调用，默认返回buffer，也可以通过 readStream.setEncoding(charset) 使得取得的内容为字符串。（从内部的缓冲区里读取内容）
2. 当内部缓冲区有数据可供读取时，readable触发（可能触发多次）。read() 方法会循环调用，直到返回null。此时，停止数据读取，直到下一次readable触发，或者end触发。
2. 回车：process.stdin.read() 返回，程序打印标准输入的内容。
3. EOF：触发end事件，CTRL+D(linux)、CTRL+Z(windows)。

```javascript
process.stdin
  .on('readable', () => {
    let chunk;
    while ((chunk = process.stdin.read()) !== null) {
      console.log(`Buffer.isBuffer(chunk): ${Buffer.isBuffer(buffer)}`); // true
      console.log(`Chunk read: ${chunk.toString()}`);
    }
  })
  .on('end', () => {
    process.stdout.write('End of Stream');
  });
```

### flowing mode

跟none-flowing mode的区别：

1. none-flowing：当内部缓冲区有数据，触发readable事件。用户需要主动调用 read() 方法读取数据。（如果用户在 readable 事件触发时，没有调用 read() 方法，会怎么样？）
2. flowing：当有数据到来时，'data' 事件触发，同时内部缓冲区的数据会被带到回调参数里。

```javascript
process.stdin
  .on('data', (chunk) => {
    console.log(`Buffer.isBuffer(chunk): ${Buffer.isBuffer(chunk)}`);
    console.log(`Chunk read: ${chunk.toString()}`);
  })
  .on('end', () => {
    process.stdout.write('End of Stream');
  });
```

flowing mode是对旧版本stream接口的继承（换个翻译方式？Stream1），在控制数据的流向方面灵活性一般。随着Stream2接口的引入，flowing mode不是默认的模式。

要将stream切换到flowing mode，有两种方式：

1. 添加 'data' 回调。
2. 调用 resume() 方法。

要让stream暂时停止抛出 'data' 事件，可以调用 pause() 方法。注意，这样并不能将stream切换到none-flowing mode，只是暂停 'data' 事件的触发，后续进来的数据会被缓存在内部缓冲区。

## 实现Readable Steam

```javascript
// randomStream.js
const { Readable } = require('stream');

const arr = [];

class RandomStream extends Readable {
  constructor (options) {
    super(options);
  }

  _read () {
    arr.push(`[RandomStream] _read() is called`);
    let num = Math.random();
    this.push(num.toString() + ' ', 'utf8');

    if (num <= 0.1) {
      this.push(null); // end
    }
  }
}

const rs = new RandomStream();
rs
.on('readable', () => {
  arr.push(`[readable] before loop`);

  let chunk;
  while ((chunk = rs.read()) !== null) {
    arr.push(`chunk read: ${chunk}`);
  }

  arr.push(`[readable] after loop`);
})
.on('end', () => {
  arr.push(`[end]`);
  console.log(arr.join('\n'));
})
```

运行结果输出如下（顺序有点不大对劲？）：

```bash
[RandomStream] _read() is called
[readable] before loop
[RandomStream] _read() is called
chunk read: 0.9455902221151478 0.4752694596188789
[RandomStream] _read() is called
chunk read: 0.9372690495391933
[RandomStream] _read() is called
chunk read: 0.053975422709547694
[readable] after loop
[readable] before loop
[readable] after loop
[readable] before loop
[readable] after loop
[readable] before loop
[readable] after loop
[end]
```


## Write Stream

通过 write() 写入数据。如果chunk是buffer类型，encoding可以忽略不计。如果chunk是string类型，则通过encoding指定编码，默认是utf8。当chunk写入完成，callback被调用。

write(chunk, [encoding], [callback])

通过 end() 结束写入。chunk、encoding、callback 参数作用跟 write() 方法相同。这里的 callback，作用跟 .on('finish', onFinishCallback) 中的 onFinishCallback 相同。

end(chunk, [encoding], [callback])


```javascript
const http = require('http');
const port = 3000;

http.createServer((req, res) => {
  let num;
  while ((num = Math.random()) > 0.1) {
    res.write('res.write(): ' + num.toString() + '\n');
  }
  res.end('res.end(): the end');
  res.on('finish', () => console.log('finished.'));
}).listen(port);
```

请求：

```bash
curl http://127.0.0.1:3000
```

输出：

```bash
res.write(): 0.3070578038171923
res.write(): 0.6395702937677197
res.write(): 0.7310690728411677
res.write(): 0.9383379632316118
res.write(): 0.47331240688271636
res.write(): 0.1311702075669403
res.write(): 0.7170623464834849
res.write(): 0.3973024871804054
res.write(): 0.7583489396978729
res.write(): 0.5808965383971327
res.write(): 0.22983892514760362
res.write(): 0.25565119168375583
res.end(): the end
```

备注：如果是通过浏览器访问，浏览器本身可能会对响应进行缓存，因此，多次调用res.write()，浏览器里有可能是一次性把内容展示出来 ）

## Duplex Stream

Duplex Stream可读、可写。开发者需要同时实现 _read()、_write() 方法。简单的例子如下：

```javascript
const { Duplex } = require('stream');

class DP extends Duplex {
  constructor (options = {}) {    
    super(options);
    this._innerChunks = [];
  }

  _write (chunk, encoding, callback) {
    this._innerChunks.push({chunk, encoding});
    callback();
  }

  _read () {
    this._innerChunks.forEach(item => {
      let upperCasedAlphabet = item.chunk.toString().toUpperCase();
      this.push(upperCasedAlphabet);
    });
    this.push(null); // end
  }
}

const dp = new DP();
dp.pipe(process.stdout);

dp.write('a');
dp.write('b');
dp.write('c');
dp.end();
```

相比 readstream、writestream，支持另外的配置参数：

* allowHalfOpen：默认是true。如果设置为false，当 read side 结束时，wirte side 也会被结束掉。
* readableObjectMode：默认是false。设置read side的objectMode。
* writableObjectMode：默认是false。设置write side的objectMode。
* readableHighWaterMark：设置read side的highWaterMark。如果有 highWaterMark 设置项存在，这个设置项会被忽略。
* writableHighWaterMark：设置write side的highWaterMark。如果有 highWaterMark 设置项存在，这个设置项会被忽略。

## Transform Stream

需要自定义 _transform()、_flush() 方法。代码如下：

```javascript
const { Transform } = require('stream');

class TR extends Transform {
  constructor (options = {}) {    
    super(options);    
  }

  _transform (chunk, encoding, callback) {
    let upperCasedAlphabet = chunk.toString().toUpperCase();
    this.push(upperCasedAlphabet);
    callback();
  }

  _flush (callback) {
    this.push('!');
    callback();
  }
}

const tr = new TR();
// tr.pipe(process.stdout);
tr.on('data', (chunk) => console.log(`ondata: ${chunk}`));

tr.write('a');
tr.write('b');
tr.write('c');
tr.end();

// ondata: A
// ondata: B
// ondata: C
// ondata: !
```


## 各种模式

combine stream：
https://www.npmjs.org/package/multipipe
https://www.npmjs.com/package/combine-stream

fork stream：

merge stream
https://www.npmjs.com/package/multistream
https://npmjs.org/package/merge-stream
https://npmjs.org/package/multistream-merge


## TODO

### readSteram

process.stdin.read() vs process.stdin.read(size) 在终端上的表现。

readable 事件触发，用户没有调用 read() 方法，会有什么影响？（丢失数据？还是数据保留在内部缓冲区，但新的数据不进去了？）

_read([size]) 方法，有没有传 size ，两者实现的区别？内部调用 push() 时，如果 返回 false，该如何处理？（返回false时，当前想push的data是否需要重新push？）

实现 Readable Stream，打印的 readable 有点不大对？

### write stream

write(chunk) 调用，如果写入的 chunk 太多，且远超过 backpressure 的值，会有什么影响（internal buffer 也容不下的情况）？

backpressure 对read stream、write stream 的影响。


### transform stream

readstream.on('data', fn) 与 readStream.pipe(stream) 的区别（）。多次调用 write()，on('data') 输出会换行。pipe() 不会换行（参考 Transform Stream小节） 

## 参考资料

Node.js Design Patterns