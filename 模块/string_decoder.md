## 模块简介

`string_decoder`模块用于将Buffer转成对应的字符串。使用者通过调用`stringDecoder.write(buffer)`，可以获得buffer对应的字符串。

它的特殊之处在于，当传入的buffer不完整（比如三个字节的字符，只传入了两个），内部会维护一个internal buffer将不完整的字节cache住，等到使用者再次调用`stringDecoder.write(buffer)`传入剩余的字节，来拼成完整的字符。

这样可以有效避免buffer不完整带来的错误，对于很多场景，比如网络请求中的包体解析等，非常有用。

## 入门例子

下面的例子中，`decoder.write(buffer)`调用传入了Buffer对象`<Buffer e4 bd a0>`，相应的返回了对应的字符串`你`;

```javascript
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

// Buffer.from('你') => <Buffer e4 bd a0>
const str = decoder.write(Buffer.from([0xe4, 0xbd, 0xa0]));
console.log(str);  // 你
```

## 例子：字节数不完整的处理

下面的例子，演示了当传入字节数不完整时，`string_decoder`模块是怎么处理的。

首先，传入了`<Buffer e4 bd a0 e5 a5>`，`好`还差1个字节，此时，`decoder.write(xx)`返回`你`。

然后，再次调用`decoder.write(Buffer.from([0xbd]))`，将剩余的1个字节传入，成功返回`好`。

```javascript
const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

// Buffer.from('你好') => <Buffer e4 bd a0 e5 a5 bd>
let str = decoder.write(Buffer.from([0xe4, 0xbd, 0xa0, 0xe5, 0xa5]));
console.log(str);  // 你

str = decoder.write(Buffer.from([0xbd]));
console.log(str);  // 好
```

>Returns any remaining input stored in the internal buffer as a string. Bytes representing incomplete UTF-8 and UTF-16 characters will be replaced with substitution characters appropriate for the character encoding.

## 相关链接

你应该记住的一个UTF-8字符「EF BF BD」
http://liudanking.com/golang/utf-8_replacement_character/