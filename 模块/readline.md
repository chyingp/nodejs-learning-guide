## 模块概览

如名字所示，readline模块用来实现逐行读取，比如读取用户输入，或者读取文件内容。模块本身比较简单，但非常使用。常见使用场景有下面几种，本文会逐一举例说明。

* 文件逐行读取：比如说进行日志分析。
* 自动完成：比如代码提示。
* 命令行工具：比如npm init这种问答式的脚手架工具。

## 基础例子

先看个简单的例子，要求用户输入一个单词，然后自动转成大写

```js
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('Please input a word: ', function(answer){
    console.log('You have entered {%s}', answer.toUpperCase());
    rl.close();
});
```

运行如下：

```bash
➜  toUpperCase git:(master) ✗ node app.js 
Please input a word: hello
You have entered {HELLO}
```

## 例子：文件逐行读取：日志分析

比如我们有如下日志文件access.log，我们想要提取“访问时间+访问地址”，借助`readline`可以很方便的完成日志分析的工作。

```
[2016-12-09 13:56:48.407] [INFO] access - ::ffff:127.0.0.1 - - "GET /oc/v/account/user.html HTTP/1.1" 200 213125 "http://www.example.com/oc/v/account/login.html" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36"
[2016-12-09 14:00:10.618] [INFO] access - ::ffff:127.0.0.1 - - "GET /oc/v/contract/underlying.html HTTP/1.1" 200 216376 "http://www.example.com/oc/v/account/user.html" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36"
[2016-12-09 14:00:34.200] [INFO] access - ::ffff:127.0.0.1 - - "GET /oc/v/contract/underlying.html HTTP/1.1" 200 216376 "http://www.example.com/oc/v/account/user.html" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.98 Safari/537.36"
```

代码如下：

```js
const readline = require('readline');
const fs = require('fs');

const rl = readline.createInterface({
    input: fs.createReadStream('./access.log')
});

rl.on('line', (line) => {
    const arr = line.split(' '); 
    console.log('访问时间：%s %s，访问地址：%s', arr[0], arr[1], arr[13]);
});
```

运行结果如下：

```bash
➜  lineByLineFromFile git:(master) ✗ node app.js
访问时间：[2016-12-09 13:56:48.407]，访问地址："http://www.example.com/oc/v/account/login.html"
访问时间：[2016-12-09 14:00:10.618]，访问地址："http://www.example.com/oc/v/account/user.html"
访问时间：[2016-12-09 14:00:34.200]，访问地址："http://www.example.com/oc/v/account/user.html"
```

## 例子：命令行工具：npmt init

## 例子：自动完成：代码提示



## 相关链接

https://nodejs.org/api/readline.html