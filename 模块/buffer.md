## 模块概览

Buffer是node的全局模块，开发者可以利用它来处理二进制数据。比如Stream模块内部就大量用到了Buffer。

## 创建

new Buffer(array)
Buffer.alloc(length)
Buffer.allocUnsafe(length)
Buffer.from(array)

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

### 通过 new Buffer()

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

## 拷贝

>Passing a string, array, or Buffer as the first argument copies the passed object's data into the Buffer.

>Passing an ArrayBuffer returns a Buffer that shares allocated memory with the given ArrayBuffer.

## 文档摘要

关于buffer内存空间的动态分配

>Instances of the Buffer class are similar to arrays of integers but correspond to fixed-sized, raw memory allocations outside the V8 heap. The size of the Buffer is established when it is created and cannot be resized.