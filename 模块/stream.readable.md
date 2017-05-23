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

