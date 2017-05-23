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
