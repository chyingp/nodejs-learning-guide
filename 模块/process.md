## 模块概览

process是node的全局模块，作用比较直观。可以通过它来获得node进程相关的信息，比如运行node程序时的命令行参数。或者设置进程相关信息，比如设置环境变量。

## 环境变量：process.env

使用频率很高，node服务运行时，时常会判断当前服务运行的环境，如下所示

```js
if(process.env.NODE_ENV === 'production'){
    console.log('生产环境');
}else{
    console.log('非生产环境');
}
```

运行命令 `NODE_ENV=production node env.js`，输出如下

```bash
非生产环境
```

## 异步：process.nextTick(fn)

使用频率同样很高，通常用在异步的场景，先来个简单的栗子：



## 获取命令行参数：process.argv

process.argv 返回一个数组，数组元素分别如下：

* 元素1：node
* 元素2：可执行文件的绝对路径
* 元素x：其他，比如参数等

```js
// print process.argv
process.argv.forEach(function(val, index, array) {
  console.log('参数' + index + ': ' + val);
});
```

运行命令 `node argv.js --env production`，输出如下。

```bash
参数0: /Users/a/.nvm/versions/node/v6.1.0/bin/node
参数1: /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.22-node-process/argv.js
参数2: --env
参数3: production
```

## 当前工作路径：process.cwd() vs process.chdir(directory)

* process.cwd()：返回当前工作路径
* process.chdir(directory)：切换当前工作路径

工作路径的用途不用过多解释了，直接上代码

```js
console.log('Starting directory: ' + process.cwd());
try {
  process.chdir('/tmp');
  console.log('New directory: ' + process.cwd());
}
catch (err) {
  console.log('chdir: ' + err);
}
```

输出如下：

```bash
Starting directory: /Users/a/Documents/git-code/nodejs-learning-guide/examples/2016.11.22-node-process
New directory: /private/tmp
```





## 相关链接

