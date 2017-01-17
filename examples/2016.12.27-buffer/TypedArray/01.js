// var int32 = new Int32Array(1);  // int32，对应4个字节

// console.log(int32.length);  // 1
// console.log(int32.buffer.byteLength);  // 4

// int32[0] = 18;

var littleEndian = (function() {
  var buffer = new ArrayBuffer(2);  // 两个字节
  var view = new DataView(buffer);  // 创建 data view
  view.setInt16(0, 256, true /* littleEndian */);  // 小端存储，也就是说 ['00000000', '00000001']
  
  // Int16Array uses the platform's endianness.
  // 通过 Int16Array 创建，那么存储方式跟平台保持一致
  // 这里的buffer是 ['00000000', '00000001']，如果是 小端存储
  // 那么，同样也是256
  // 注意，这里的 new Int16Array() 每个元素是2个字节
  // 也就是说，参数为 buffer 时，实际只有1个元素  new Int16Array(buffer).length === 1
  // 所以 new Int16Array(buffer)[0] === 256 为 true
  // 
  // 同理，如果平台为小端，littleEndian 参数设置为false
  // 那么，data view 里为 ['00000001', '00000000']
  // 此时，对于 int16Array 来说，看到的二进制数为 '00000000 00000001'
  // 所以此时 new Int16Array(buffer)[0] === 1
  return new Int16Array(buffer)[0] === 256;  
})();
console.log(littleEndian); // true or false


// ['00000001', '00000000']