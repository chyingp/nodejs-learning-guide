## 模块概览

events模块是node的核心模块之一，几乎所有常用的node模块都继承了events模块，比如http、fs等。

模块本身非常简单，API虽然也不少，但常用的就那么几个，这里举几个简单例子。

## 基础例子

下面一共是6个例子，都非常简单，可以直接拷贝出来运行。例子5比较有意思，虽然也并不复杂，但确实是容易记错的点，感兴趣的同学可以看下。

### 例子1：单个事件监听器

```js
var EventEmitter = require('events');

class Man extends EventEmitter {}

var man = new Man();

man.on('wakeup', function(){
    console.log('man has woken up');
});

man.emit('wakeup');
// 输出如下：
// man has woken up
```

### 例子2：同个事件，多个事件监听器

可以看到，事件触发时，事件监听器按照注册的顺序执行。

```js
var EventEmitter = require('events');

class Man extends EventEmitter {}

var man = new Man();

man.on('wakeup', function(){
    console.log('man has woken up');
});

man.on('wakeup', function(){
    console.log('man has woken up again');
});

man.emit('wakeup');

// 输出如下：
// man has woken up
// man has woken up again
```

### 例子3：只运行一次的事件监听器

```js
var EventEmitter = require('events');

class Man extends EventEmitter {}

var man = new Man();

man.on('wakeup', function(){
    console.log('man has woken up');
});

man.once('wakeup', function(){
    console.log('man has woken up again');
});

man.emit('wakeup');
man.emit('wakeup');

// 输出如下：
// man has woken up
// man has woken up again
// man has woken up
```

### 例子4：注册事件监听器前，事件先触发

可以看到，注册事件监听器前，事件先触发，则该事件会直接被忽略。

```js
var EventEmitter = require('events');

class Man extends EventEmitter {}

var man = new Man();

man.emit('wakeup', 1);

man.on('wakeup', function(index){
    console.log('man has woken up ->' + index);
});

man.emit('wakeup', 2);
// 输出如下：
// man has woken up ->2
```

### 例子5：异步执行，还是顺序执行

例子很简单，但非常重要。究竟是代码1先执行，还是代码2先执行，这点差异，无论对于我们理解别人的代码，还是自己编写node程序，都非常关键。

实践证明，代码1先执行了。(node v6.1.0)

```js
var EventEmitter = require('events');

class Man extends EventEmitter {}

var man = new Man();

man.on('wakeup', function(){
    console.log('man has woken up'); // 代码1
});

man.emit('wakeup');

console.log('woman has woken up');  // 代码2

// 输出如下：
// man has woken up
// woman has woken up
```

### 例子6：移除事件监听器

```js
var EventEmitter = require('events');

function wakeup(){
    console.log('man has woken up');
}

class Man extends EventEmitter {}

var man = new Man();

man.on('wakeup', wakeup);
man.emit('wakeup');

man.removeListener('wakeup', wakeup);
man.emit('wakeup');

// 输出如下：
// man has woken up
```

## 相关链接

https://nodejs.org/api/events.html

