## 模块概览

readline是个非常实用的模块。如名字所示，主要用来实现逐行读取，比如读取用户输入，或者读取文件内容。常见使用场景有下面几种，本文会逐一举例说明。

* 文件逐行读取：比如说进行日志分析。
* 自动完成：比如输入npm，自动提示"help init install"。
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
    console.log('You have entered [%s]', answer.toUpperCase());
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

## 例子：自动完成：代码提示

这里我们实现一个简单的自动完成功能，当用户输入npm时，按tab键，自动提示用户可选的子命令，如help、init、install。

* 输入`np`，按下tab：自动补全为npm
* 输入`npm in`，按下tab：自动提示可选子命令 init、install
* 输入`npm inst`，按下tab：自动补全为 `npm install`

```js
const readline = require('readline');
const fs = require('fs');

function completer(line) {
    const command = 'npm';
    const subCommands = ['help', 'init', 'install'];

    // 输入为空，或者为npm的一部分，则tab补全为npm
    if(line.length < command.length){
        return [command.indexOf(line) === 0 ? [command] : [], line];
    }

    // 输入 npm，tab提示 help init install
    // 输入 npm in，tab提示 init install
    let hits = subCommands.filter(function(subCommand){ 
        const lineTrippedCommand = line.replace(command, '').trim();
        return lineTrippedCommand && subCommand.indexOf( lineTrippedCommand ) === 0;
    })

    if(hits.length === 1){
        hits = hits.map(function(hit){
            return [command, hit].join(' ');
        });
    }
  
    return [hits.length ? hits : subCommands, line];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: completer
});

rl.prompt();
```

代码运行效果如下，当输入`npm in`，按下tab键，则会自动提示可选子命令init、install。

```bash
➜  autoComplete git:(master) ✗ node app.js
> npm in
init     install  
```

## 例子：命令行工具：npmt init

下面借助readline实现一个迷你版的`npm init`功能，运行脚本时，会依次要求用户输入name、version、author属性（其他略过）。

这里用到的是`rl.question(msg, cbk)`这个方法，它会在控制台输入一行提示，当用户完成输入，敲击回车，`cbk`就会被调用，并把用户输入作为参数传入。

```js
const readline = require('readline');
const fs = require('fs');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'OHAI> '
});

const preHint = `
This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See \`npm help json\` for definitive documentation on these fields
and exactly what they do.

Use \`npm install <pkg> --save\` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.
`;

console.log(preHint);

// 问题
let questions = [ 'name', 'version', 'author'];

// 默认答案
let defaultAnswers = [ 'name', '1.0.0', 'none' ];

// 用户答案
let answers = [];
let index = 0;

function createPackageJson(){
    var map = {};
    questions.forEach(function(question, index){
        map[question] = answers[index];
    });

    fs.writeFileSync('./package.json', JSON.stringify(map, null, 4));
}

function runQuestionLoop() {

    if(index === questions.length) {
        createPackageJson();
        rl.close();
        return;
    }
    
    let defaultAnswer = defaultAnswers[index];
    let question = questions[index] + ': (' + defaultAnswer +') ';
    
    rl.question(question, function(answer){
        answers.push(answer || defaultAnswer);
        index++;
        runQuestionLoop();
    });
}

runQuestionLoop();
```

运行效果如下，最后还像模像样的生成了package.json（害羞脸）。

```bash
➜  commandLine git:(master) ✗ node app.js

This utility will walk you through creating a package.json file.
It only covers the most common items, and tries to guess sensible defaults.

See `npm help json` for definitive documentation on these fields
and exactly what they do.

Use `npm install <pkg> --save` afterwards to install a package and
save it as a dependency in the package.json file.

Press ^C at any time to quit.

name: (name) hello
version: (1.0.0) 0.0.1
author: (none) chyingp
```

## 写在后面

有不少基于readline的有趣的工具，比如各种脚手架工具。限于篇幅不展开，感兴趣的同学可以研究下。

## 相关链接

https://nodejs.org/api/readline.html