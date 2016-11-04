## 模块概述

在nodejs中，提供了**querystring**这个模块，用来做url查询参数的解析，使用非常简单。

模块总共有四个方法，绝大部分时，我们只会用到 **.parse()**、 **.stringify()**两个方法。剩余的方法，感兴趣的同学可自行查看文档。

* **.parse()**：对url查询参数（字符串）进行解析，生成易于分析的json格式。
* **.stringif()**：跟**.parse()**相反，用于拼接查询查询。

```javascript
querystring.parse(str[, sep[, eq[, options]]])
querystring.stringify(obj[, sep[, eq[, options]]])
```

## 查询参数解析：querystring.parse()

>参数：querystring.parse(str[, sep[, eq[, options]]])

第四个参数几乎不会用到,直接不讨论. 第二个, 第三个其实也很少用到,但某些时候还是可以用一下。直接看例子

```javascript
var querystring = require('querystring');
var str = 'nick=casper&age=24';
var obj = querystring.parse(str);
console.log(JSON.stringify(obj, null, 4));
```

输出如下

```javascript
{
    "nick": "casper",
    "age": "24"
}
```

再来看下`sep`、`eq`有什么作用。相当于可以替换`&`、`=`为自定义字符，对于下面的场景来说还是挺省事的。

```javascript
var str1 = 'nick=casper&age=24&extra=name-chyingp|country-cn';
var obj1 = querystring.parse(str1);
var obj2 = querystring.parse(obj1.extra, '|', '-');
console.log(JSON.stringify(obj2, null, 4));
```

输出如下

```javascript
{
    "name": "chyingp",
    "country": "cn"
}
```

## 查询参数拼接：querystring.stringify()

>querystring.stringify(obj[, sep[, eq[, options]]])

没什么好说的，相当于`parse`的逆向操作。直接看代码

```javascript
var querystring = require('querystring');

var obj1 = {
    "nick": "casper",
    "age": "24"
};
var str1 = querystring.stringify(obj1);
console.log(str1);

var obj2 = {
    "name": "chyingp",
    "country": "cn"
};
var str2 = querystring.stringify(obj2, '|', '-');
console.log(str2);
```

输出如下

```javascript
nick=casper&age=24
name-chyingp|country-cn
```

## 相关链接

官方文档：https://nodejs.org/api/querystring.html