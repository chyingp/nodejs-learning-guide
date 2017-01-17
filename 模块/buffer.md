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



## TypedArray vs ArrayBuffer vs DataView

>The DataView view provides a low-level interface for reading and writing multiple number types in an ArrayBuffer irrespective of the platform's endianness.

在新的标准里面，js引入`TypedArray`，方便开发者像操作数组那样，操作二进制数据。需要注意的是，`TypedArray`这个构造函数本身不存在，它只是一类构造函数的统称而已，比如`Int8Array`。

也就是说，这样使用是错误的。

```js
new TypedArray();  // 输出：ReferenceError: TypedArray is not defined
```

`TypedArray()`有包含下面清单，感兴趣的可以查看[这里](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray)：

```js
Int8Array();
Uint8Array();
Uint8ClampedArray();
Int16Array();
Uint16Array();
Int32Array();
Uint32Array();
Float32Array();
Float64Array();
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

console.log(buf5.equals(buf6));
```

### buf.compare(target[, targetStart[, targetEnd[, sourceStart[, sourceEnd]]]])

同样是对两个buffer实例进行比较，不同的是：

1. 可以指定特定比较的范围（通过start、end指定）
2. 返回值为整数，达标buf、target的大小关系

假设返回值为

* `0`：buf、target大小相同。
* `1`：buf大于target，也就是说buf应该排在target之后。
* `-1`：buf小于target，也就是说buf应该排在target之前。

看例子：



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