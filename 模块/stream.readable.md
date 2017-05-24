## 两种模式

flowing mode + paused mode

默认：paused mode（刚创建时）

paused mode -> flowing mode 几种方式

1. 添加 stream.on('data', fn) 事件监听
2. 调用 stream.resume()
3. 调用 stream.pipe()


```js
var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');

console.log('1. isPaused: ' + readstream.isPaused());

setTimeout(function() {
    readstream.on('data', function (content) {
        console.log(`3. content is [ %s ]` + content);
    });
    console.log('2. isPaused: ' + readstream.isPaused());
}, 3000);
```

输出如下：

```bash
1. isPaused: false
2. isPaused: false
3. content is [ %s ]hello world
```

## 三种状态

* readable._readableState.flowing = null
* readable._readableState.flowing = false
* readable._readableState.flowing = true

分别解释下：

* null：当前还没有地方在消费数据（比如调用readable.pipe(dst)或者readable.on('data', fn)），此时为null。
* true：当前正在消费数据（比如调用readable.pipe(dst)或者readable.on('data', fn)），此时为true；
* false：调用比如`readable.pause()`、`readable.unpipe()`，会将状态置为false。需要注意的时，状态为false不代表不生产数据。有可能没有地方消费数据，但数据还在继续产生，并在internal buffer里缓存起来。

## close事件

1. close事件触发的含义：接下来不会再有新的事件抛出。
2. close事件触发的时机：当stream以及对应的底层资源（比如文件描述符）已经关闭（这段翻译过来好拗口）

```javascript
var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');

readstream.on('data', function (chunk) {
    console.log('on data: %s', chunk);
});

readstream.on('close', function () {
    console.log('on close');
});
```

输出：

```bash
on data: hello world
on close
```

## data事件

1. 触发时机：当stream在flowing状态，并且有数据进来的时候。
2. 回调参数chunk的类型：默认是Buffer类型，当调用stream.setEncoding('xx')时，则为String类型。
3. 其他：当stream没有被明确暂停（比如调用stream.pause())，给stream添加data事件会将stream转成flowing模式。



```javascript
var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');
var readstream2 = fs.createReadStream('./hello.txt');
var readstream3 = fs.createReadStream('./hello.txt');

readstream.on('data', function (chunk) {
    console.log('1. chunk type is Buffer ? %s', Buffer.isBuffer(chunk));
});

readstream2.setEncoding('utf8');
readstream2.on('data', function (chunk) {
    console.log('2. chunk type is String ? %s', typeof chunk === 'string');    
});

readstream3.setEncoding('utf8');
readstream3.on('data', function (chunk) {
    console.log('3. data is: %s', chunk);
});

// 输出
// 1. chunk type is Buffer ? true
// 2. chunk type is String ? true
// 3. data is: hello world
```

>Attaching a 'data' event listener to a stream that has not been explicitly paused will switch the stream into flowing mode. Data will then be passed as soon as it is available.

## end事件

1. 触发时机：当没有更多数据等待消费。

```javascript
var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');

readstream.on('data', function (chunk) {
    console.log('on data: %s', chunk);
});

readstream.on('end', function () {
    console.log('on end');
});

readstream.on('close', function () {
    console.log('on close');
});

// 输出：
// on data: hello world
// on end
// on close
```

## error事件

1. 触发实机：任何时候都可能触发，原因可能有多种，比如读取一个不存在的文件，或者stream push了非法的数据等。

```javascript
var fs = require('fs');
var readstream = fs.createReadStream('./none-exists.txt');

readstream.on('error', function (error) {
    console.log('on error: %s', error.message);
});

// 输出：
// on error: ENOENT: no such file or directory, open './none-exists.txt'
```

如果没有添加 error 事件监听，报错并退出

```bash
events.js:160
      throw er; // Unhandled 'error' event
      ^

Error: ENOENT: no such file or directory, open './none-exists.txt'
    at Error (native)
```

## readable事件

1. 触发时机：当有数据可读时，或者数据已经读完，但是end尚未触发（感觉这样设计不合理）

```javascript
var fs = require('fs');
var readstream = fs.createReadStream('./hello.txt');
readstream.on('readable', function() {
  console.log('readable: %s', readstream.read());
});
readstream.on('end', function() {
  console.log('end');
});

// 输出：
// readable: hello world
// readable: null
// end
```

## pipe方法

>stream.pipe(dest, {end: true})

stream.pipe(dest)返回dest，也就是说可以链式调用 stream.pipe(dest1).pipe(dest2)...

```javascript
var fs = require('fs');
var r = fs.createReadStream('./hello.txt');
var z = require('zlib').createGzip();
var w = fs.createWriteStream('./hello.txt.gz');

r.pipe(z).pipe(w);
```

当end为true（默认）时，当数据读取结束，dest会自动关闭；否则dest不自动关闭。

例子：end事件触发时，dest已经被关闭，此时再往dest写数据，报错

```javascript
var fs = require('fs');
var src = fs.createReadStream('./hello.txt');
var dest = fs.createWriteStream('./dest.txt');

src.pipe(dest);

src.on('end', function () {
    try{
        dest.end(' end');
    }catch(error){
        console.log('error! error.message is %s', error.message);
    }
    
    console.log('end');
});

// 输出：
// error! error.message is write after end
// end
```

显示声明`end`为`true`，成功写入。

```javascript
var fs = require('fs');
var src = fs.createReadStream('./hello.txt');
var dest = fs.createWriteStream('./dest.txt');

src.pipe(dest, { end: false });

src.on('end', function () {
    dest.end(' end');
    console.log('end');
});
```

## read(size)方法

作用：读取internal buffer中的数据（在paused模式下使用）
参数说明：size，要读取的字节数
返回：Buffer 或者 String 或者 null

* Buffer：默认返回类型。
* String：当已调用了stream.setEncoding(encoding) 时，返回String类型。
* null：当前没有数据可以读取。（比如已经全部读完，或者读取的速度过快，当前internal buffer还没进入可读取状态）

如果指定了size，且

1. 当前还没有足够的数据可以读取，返回null
2. 如果stram已经end了，那么一次性返回internal buffer中的所有数据（有可能超过size大小）

>The optional size argument specifies a specific number of bytes to read. If size bytes are not available to be read, null will be returned unless the stream has ended, in which case all of the data remaining in the internal buffer will be returned (even if it exceeds size bytes).

如果没有指定size，那么，internal buffer中的所有数据一次性返回。

>If the size argument is not specified, all of the data contained in the internal buffer will be returned.

如果 readable.read() 返回了数据，那么 data 事件会被触发。

>Note: If the readable.read() method returns a chunk of data, a 'data' event will also be emitted.

通过 fs.createReadStream(path, options) 创建的 stream，internal buffer 的大小为 64kb 

>Be aware that, unlike the default value set for highWaterMark on a readable stream (16 kb), the stream returned by this method has a default value of 64 kb for the same parameter.

看例子：

```javascript
var fs = require('fs');
var readable = fs.createReadStream('./jquery-3.2.1.js');

readable.on('readable', function (chunk) {
  var chunk;  
  while (null !== (chunk = readable.read())) {
    console.log(`Received ${Math.ceil(chunk.length/1024)} kb of data.`);
  }    
});

// 输出
// Received 64 kb of data.
// Received 64 kb of data.
// Received 64 kb of data.
// Received 64 kb of data.
// Received 6 kb of data.
```

试下指定size

```javascript
var fs = require('fs');
var readable = fs.createReadStream('./jquery-3.2.1.js');
var size = 1024 * 32;  // 32k

readable.on('readable', function (chunk) {
  var chunk;  
  while (null !== (chunk = readable.read(size))) {
    console.log(`Received ${Math.ceil(chunk.length/1024)} kb of data.`);
  }    
});

// 输出
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 32 kb of data.
// Received 6 kb of data.
```

## readable.unpipe([destination])

作用：停止向 destination 写入数据。
参数：destination 可选，如果没有指定，则对所有 dest 的写入都被停止。

例子：略

## readable.unshift(chunk)



>Note: The stream.unshift(chunk) method cannot be called after the 'end' event has been emitted or a runtime error will be thrown.

>Developers using stream.unshift() often should consider switching to use of a Transform stream instead. See the API for Stream Implementers section for more information.