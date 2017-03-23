## 写在前面

js最初并没有读写二进制的API，Node.js引入了Buffer类，以便开发者能够对二进制数据进行操作，比如网络请求、文件操作等。

随着ES6规范里TypedArray的增加，Node.js的Buffer类也实现了 Uint8Array 的API。。。

## TypedArray vs ArrayBuffer vs DataView

关于 TypedArray：

>A TypedArray object describes an array-like view of an underlying binary data buffer.

>When creating a TypedArray instance (i.e. instance of Int8Array or similar), an array buffer is created internally (if ArrayBuffer object is present as constructor argument then this array buffer is used) in memory and this buffer address is saved as internal property of that instances, and all the methods of %TypedArray%.prototype uses that array buffer address to operate on i.e. set value and get value etc.

```javascript
new TypedArray(length);
new TypedArray(typedArray);
new TypedArray(object);
new TypedArray(buffer [, byteOffset [, length]]);

// where TypedArray() is one of:

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


关于 ArrayBuffer

>The ArrayBuffer object is used to represent a generic, fixed-length raw binary data buffer. You cannot directly manipulate the contents of an ArrayBuffer; instead, you create one of the typed array objects or a DataView object which represents the buffer in a specific format, and use that to read and write the contents of the buffer.

length: The size, in bytes, of the array buffer to create.

```javascript
new ArrayBuffer(length)
```

关于 DataView

>The DataView view provides a low-level interface for reading and writing multiple number types in an ArrayBuffer irrespective of the platform's endianness.

buffer: An existing ArrayBuffer to use as the storage for the new DataView object.

```javascript
new DataView(buffer [, byteOffset [, byteLength]])
```

## Endianness

>little-endian, which is used on all Intel processors. Little-endian means storing bytes in order of least-to-most-significant (where the least significant byte takes the first or lowest address)

>Naturally, big-endian is the opposite order, comparable to an ISO date (2050-12-31). Big-endian is also often called "network byte order", because Internet standards usually require data to be stored big-endian, starting at the standard UNIX socket level and going all the way up to standardized Web binary data structures



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

## 相关链接
