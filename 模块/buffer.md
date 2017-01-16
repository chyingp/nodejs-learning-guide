## 模块概览

Buffer是node的全局模块，开发者可以利用它来处理二进制数据。比如Stream模块内部就大量用到了Buffer。

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

## 拷贝

>Passing a string, array, or Buffer as the first argument copies the passed object's data into the Buffer.

>Passing an ArrayBuffer returns a Buffer that shares allocated memory with the given ArrayBuffer.


## TODO

1、创建、拷贝、截取、转换、查找
2、buffer、arraybuffer、dataview、typedarray
3、buffer vs 编码
4、Buffer.from()、Buffer.alloc()、Buffer.alocUnsafe()
5、Buffer vs TypedArray

## 文档摘要

关于buffer内存空间的动态分配

>Instances of the Buffer class are similar to arrays of integers but correspond to fixed-sized, raw memory allocations outside the V8 heap. The size of the Buffer is established when it is created and cannot be resized.