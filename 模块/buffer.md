## 模块概览

Buffer是node的核心模块，开发者可以利用它来处理二进制数据，比如文件流的读写、网络请求数据的处理等。

Buffer的API非常多，本文仅挑选 比较常用/容易理解 的API进行讲解，包括Buffer实例的创建、比较、连接、拷贝、查找、遍历、类型转换、截取、编码转换等。

## 创建

* new Buffer(array)
* Buffer.alloc(length)
* Buffer.allocUnsafe(length)
* Buffer.from(array)

### 通过 new Buffer(array)

```js
// Creates a new Buffer containing the ASCII bytes of the string 'buffer'
const buf = new Buffer([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
```

验证下：

```js
var array = 'buffer'.split('').map(function(v){
    return '0x' + v.charCodeAt(0).toString(16)
});

console.log( array.join() );
// 输出：0x62,0x75,0x66,0x66,0x65,0x72
```

### 通过 Buffer.alloc(length)

```js
var buf1 = Buffer.alloc(10);  // 长度为10的buffer，初始值为0x0
var buf2 = Buffer.alloc(10, 1);  // 长度为10的buffer，初始值为0x1
```

```js
var buf3 = Buffer.allocUnsafe(10);  // 长度为10的buffer，初始值不确定
```

```js
var buf4 = Buffer.from([1, 2, 3])  // 长度为3的buffer，初始值为 0x01, 0x02, 0x03
```

### 通过Buffer.from()

例子一：Buffer.from(array)

```js
// [0x62, 0x75, 0x66, 0x66, 0x65, 0x72] 为字符串 "buffer" 
// 0x62 为16进制，转成十进制就是 98，代表的就是字母 b
var buf = Buffer.from([0x62, 0x75, 0x66, 0x66, 0x65, 0x72]);
console.log(buf.toString());
```

例子二：Buffer.from(string[, encoding])

通过string创建buffer，跟将buffer转成字符串时，记得编码保持一致，不然会出现乱码，如下所示。

```js
var buf = Buffer.from('this is a tést');  // 默认采用utf8

// 输出：this is a tést
console.log(buf.toString());  // 默认编码是utf8，所以正常打印

// 输出：this is a tC)st
console.log(buf.toString('ascii'));  // 转成字符串时，编码不是utf8，所以乱码
```

对乱码的分析如下：

```js
var letter = 'é';
var buff = Buffer.from(letter);  // 默认编码是utf8，这里占据两个字节 <Buffer c3 a9>
var len = buff.length;  // 2
var code = buff[0]; // 第一个字节为0xc3，即195：超出ascii的最大支持范围
var binary = code.toString(2);  // 195的二进制：10101001
var finalBinary = binary.slice(1);  // 将高位的1舍弃，变成：0101001
var finalCode = parseInt(finalBinary, 2);  // 0101001 对应的十进制：67
var finalLetter = String.fromCharCode(finalCode);  // 67对应的字符：C

// 同理 0xa9最终转成的ascii字符为)
// 所以，最终输出为 this is a tC)st
```

例子三：Buffer.from(buffer)

创建新的Buffer实例，并将buffer的数据拷贝到新的实例子中去。

```js
var buff = Buffer.from('buffer');
var buff2 = Buffer.from(buff);

console.log(buff.toString());  // 输出：buffer
console.log(buff2.toString());  // 输出：buffer

buff2[0] = 0x61;

console.log(buff.toString());  // 输出：buffer
console.log(buff2.toString());  // 输出：auffer
```


## buffer比较

### buf.equals(otherBuffer)

判断两个buffer实例存储的数据是否相同，如果是，返回true，否则返回false。

```js
// 例子一：编码一样，内容相同
var buf1 = Buffer.from('A');
var buf2 = Buffer.from('A');

console.log( buf1.equals(buf2) );  // true

// 例子二：编码一样，内容不同
var buf3 = Buffer.from('A');
var buf4 = Buffer.from('B');

console.log( buf3.equals(buf4) );  // false

// 例子三：编码不一样，内容相同
var buf5 = Buffer.from('ABC');  // <Buffer 41 42 43>
var buf6 = Buffer.from('414243', 'hex');

console.log(buf5.equals(buf6));    //true

//只要比较的两者内容相同,`buf.equals(otherBuffer)` 就返回true
```

### buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])

同样是对两个buffer实例进行比较，不同的是：

1. 可以指定特定比较的范围（通过start、end指定）
2. 返回值为整数，达标buf、target的大小关系

假设返回值为

* `0`：buf、target大小相同。
* `1`：buf大于target，也就是说buf应该排在target之后。
* `-1`：buf小于target，也就是说buf应该排在target之前。

看例子，官方的例子挺好的，直接贴一下：

```js
const buf1 = Buffer.from('ABC');
const buf2 = Buffer.from('BCD');
const buf3 = Buffer.from('ABCD');

// Prints: 0
console.log(buf1.compare(buf1));

// Prints: -1
console.log(buf1.compare(buf2));

// Prints: -1
console.log(buf1.compare(buf3));

// Prints: 1
console.log(buf2.compare(buf1));

// Prints: 1
console.log(buf2.compare(buf3));

// Prints: [ <Buffer 41 42 43>, <Buffer 41 42 43 44>, <Buffer 42 43 44> ]
// (This result is equal to: [buf1, buf3, buf2])
console.log([buf1, buf2, buf3].sort(Buffer.compare));
```

### Buffer.compare(buf1, buf2)

跟 `buf.compare(target)` 大同小异，一般用于排序。直接贴官方例子：

```js
const buf1 = Buffer.from('1234');
const buf2 = Buffer.from('0123');
const arr = [buf1, buf2];

// Prints: [ <Buffer 30 31 32 33>, <Buffer 31 32 33 34> ]
// (This result is equal to: [buf2, buf1])
console.log(arr.sort(Buffer.compare));
```

## 从Buffer.from([62])谈起

这里稍微研究下Buffer.from(array)。下面是官方文档对API的说明，也就是说，每个array的元素对应1个字节（8位），取值从0到255。

>Allocates a new Buffer using an array of octets.

### 数组元素为数字

首先看下，传入的元素为数字的场景。下面分别是10进制、8进制、16进制，跟预期中的结果一致。

```js
var buff = Buffer.from([62])
// <Buffer 3e>
// buff[0] === parseInt('3e', 16) === 62
```

```js
var buff = Buffer.from([062])
// <Buffer 32>
// buff[0] === parseInt(62, 8) === parseInt(32, 16) === 50
```

```js
var buff = Buffer.from([0x62])
// <Buffer 62>
// buff[0] === parseInt(62, 16) === 98
```

### 数组元素为字符串

再看下，传入的元素为字符串的场景。

1. `0`开头的字符串，在parseInt('062')时，可以解释为62，也可以解释为50（八进制），这里看到采用了第一种解释。
2. 字符串的场景，跟parseInt()有没有关系，暂未深入探究，只是这样猜想。TODO（找时间研究下）

```js
var buff = Buffer.from(['62'])
// <Buffer 3e>
// buff[0] === parseInt('3e', 16) === parseInt('62') === 62
```

```js
var buff = Buffer.from(['062'])
// <Buffer 3e>
// buff[0] === parseInt('3e', 16) === parseInt('062') === 62
```

```js
var buff = Buffer.from(['0x62'])
// <Buffer 62>
// buff[0] === parseInt('62', 16) === parseInt('0x62') === 98
```

### 数组元素大小超出1个字节

感兴趣的同学自行探究。

```js
var buff = Buffer.from([256])
// <Buffer 00>
```

## Buffer.from('1')

一开始不自觉的会将`Buffer.from('1')[0]`跟`"1"`划等号，其实`"1"`对应的编码是49。

```js
var buff = Buffer.from('1')  // <Buffer 31>
console.log(buff[0] === 1)  // false
```

这样对比就知道了，编码为1的是个控制字符，表示 Start of Heading。

```js
console.log( String.fromCharCode(49) )  // '1'
console.log( String.fromCharCode(1) )  // '\u0001'
```

## buffer连接：Buffer.concat(list[, totalLength])

备注：个人觉得`totalLength`这个参数挺多余的，从官方文档来看，是处于性能提升的角度考虑。不过内部实现也只是遍历list，将length累加得到totalLength，从这点来看，性能优化是几乎可以忽略不计的。

```js
var buff1 = Buffer.alloc(10);
var buff2 = Buffer.alloc(20);

var totalLength = buff1.length + buff2.length;

console.log(totalLength);  // 30

var buff3 = Buffer.concat([buff1, buff2], totalLength);

console.log(buff3.length);  // 30
```

除了上面提到的性能优化，totalLength还有两点需要注意。假设list里面所有buffer的长度累加和为length

* totalLength > length：返回长度为totalLength的Buffer实例，超出长度的部分填充0。
* totalLength < length：返回长度为totalLength的Buffer实例，后面部分舍弃。

```js
var buff4 = Buffer.from([1, 2]);
var buff5 = Buffer.from([3, 4]);

var buff6 = Buffer.concat([buff4, buff5], 5);

console.log(buff6.length);  // 
console.log(buff6);  // <Buffer 01 02 03 04 00>

var buff7 = Buffer.concat([buff4, buff5], 3);

console.log(buff7.length);  // 3
console.log(buff7);  // <Buffer 01 02 03>
```

## 拷贝：buf.copy(target[, targetStart[, sourceStart[, sourceEnd]]])

使用比较简单，如果忽略后面三个参数，那就是将buf的数据拷贝到target里去，如下所示：

```js
var buff1 = Buffer.from([1, 2]);
var buff2 = Buffer.alloc(2);

buff1.copy(buff2);

console.log(buff2);  // <Buffer 01 02>
```

另外三个参数比较直观，直接看官方例子

```js
const buf1 = Buffer.allocUnsafe(26);
const buf2 = Buffer.allocUnsafe(26).fill('!');

for (let i = 0 ; i < 26 ; i++) {
  // 97 is the decimal ASCII value for 'a'
  buf1[i] = i + 97;
}

buf1.copy(buf2, 8, 16, 20);

// Prints: !!!!!!!!qrst!!!!!!!!!!!!!
console.log(buf2.toString('ascii', 0, 25));
```

## 查找：buf.indexOf(value[, byteOffset][, encoding])

跟数组的查找差不多，需要注意的是，value可能是String、Buffer、Integer中的任意类型。

* String：如果是字符串，那么encoding就是其对应的编码，默认是utf8。
* Buffer：如果是Buffer实例，那么会将value中的完整数据，跟buf进行对比。
* Integer：如果是数字，那么value会被当做无符号的8位整数，取值范围是0到255。

另外，可以通过`byteOffset`来指定起始查找位置。

直接上代码，官方例子妥妥的，耐心看完它基本就理解得差不多了。

```js
const buf = Buffer.from('this is a buffer');

// Prints: 0
console.log(buf.indexOf('this'));

// Prints: 2
console.log(buf.indexOf('is'));

// Prints: 8
console.log(buf.indexOf(Buffer.from('a buffer')));

// Prints: 8
// (97 is the decimal ASCII value for 'a')
console.log(buf.indexOf(97));

// Prints: -1
console.log(buf.indexOf(Buffer.from('a buffer example')));

// Prints: 8
console.log(buf.indexOf(Buffer.from('a buffer example').slice(0, 8)));


const utf16Buffer = Buffer.from('\u039a\u0391\u03a3\u03a3\u0395', 'ucs2');

// Prints: 4
console.log(utf16Buffer.indexOf('\u03a3', 0, 'ucs2'));

// Prints: 6
console.log(utf16Buffer.indexOf('\u03a3', -4, 'ucs2'));
```

## 写：buf.write(string[, offset[, length]][, encoding])

将sring写入buf实例，同时返回写入的字节数。

参数如下：

* string：写入的字符串。
* offset：从buf的第几位开始写入，默认是0。
* length：写入多少个字节，默认是 buf.length - offset。
* encoding：字符串的编码，默认是utf8。

看个简单例子

```js
var buff = Buffer.alloc(4);
buff.write('a');  // 返回 1
console.log(buff);  // 打印 <Buffer 61 00 00 00>

buff.write('ab');  // 返回 2
console.log(buff);  // 打印 <Buffer 61 62 00 00>
```

## 填充：buf.fill(value[, offset[, end]][, encoding])

用`value`填充buf，常用于初始化buf。参数说明如下：

* value：用来填充的内容，可以是Buffer、String或Integer。
* offset：从第几位开始填充，默认是0。
* end：停止填充的位置，默认是 buf.length。
* encoding：如果`value`是String，那么为`value`的编码，默认是utf8。

例子：

```js
var buff = Buffer.alloc(20).fill('a');

console.log(buff.toString());  // aaaaaaaaaaaaaaaaaaaa
```

## 转成字符串: buf.toString([encoding[, start[, end]]])

把buf解码成字符串，用法比较直观，看例子

```js
var buff = Buffer.from('hello');

console.log( buff.toString() );  // hello

console.log( buff.toString('utf8', 0, 2) );  // he
```

## 转成JSON字符串：buf.toJSON()

```js
var buff = Buffer.from('hello');

console.log( buff.toJSON() );  // { type: 'Buffer', data: [ 104, 101, 108, 108, 111 ] }
```

## 遍历：buf.values()、buf.keys()、buf.entries()

用于对`buf`进行`for...of`遍历，直接看例子。

```js
var buff = Buffer.from('abcde');

for(const key of buff.keys()){
    console.log('key is %d', key);
}
// key is 0
// key is 1
// key is 2
// key is 3
// key is 4

for(const value of buff.values()){
    console.log('value is %d', value);
}
// value is 97
// value is 98
// value is 99
// value is 100
// value is 101

for(const pair of buff.entries()){
    console.log('buff[%d] === %d', pair[0], pair[1]);
}
// buff[0] === 97
// buff[1] === 98
// buff[2] === 99
// buff[3] === 100
// buff[4] === 101
```

## 截取：buf.slice([start[, end]])

用于截取buf，并返回一个新的Buffer实例。需要注意的是，这里返回的Buffer实例，指向的仍然是buf的内存地址，所以对新Buffer实例的修改，也会影响到buf。

```js
var buff1 = Buffer.from('abcde');
console.log(buff1);  // <Buffer 61 62 63 64 65>

var buff2 = buff1.slice();
console.log(buff2);  // <Buffer 61 62 63 64 65>

var buff3 = buff1.slice(1, 3);
console.log(buff3);  // <Buffer 62 63>

buff3[0] = 97;  // parseInt(61, 16) ==> 97
console.log(buff1);  // <Buffer 62 63>
```

## TODO

1. 创建、拷贝、截取、转换、查找
2. buffer、arraybuffer、dataview、typedarray
3. buffer vs 编码
4. Buffer.from()、Buffer.alloc()、Buffer.alocUnsafe()
5. Buffer vs TypedArray

## 文档摘要

关于buffer内存空间的动态分配

>Instances of the Buffer class are similar to arrays of integers but correspond to fixed-sized, raw memory allocations outside the V8 heap. The size of the Buffer is established when it is created and cannot be resized.

## 相关链接

unicode对照表
https://unicode-table.com/cn/#control-character

字符编码笔记：ASCII，Unicode和UTF-8
http://www.ruanyifeng.com/blog/2007/10/ascii_unicode_and_utf-8.html
