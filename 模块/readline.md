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

## 基础例子

## 命令行工具：npmt init

## 自动完成：代码提示

## 文件逐行读取：日志分析

## 相关链接

https://nodejs.org/api/readline.html