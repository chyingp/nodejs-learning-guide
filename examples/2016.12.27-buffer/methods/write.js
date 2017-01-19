var buff = Buffer.alloc(4);
buff.write('a');  // 返回 1
console.log(buff);  // 打印 <Buffer 61 00 00 00>

buff.write('ab');  // 返回 2
console.log(buff);  // 打印 <Buffer 61 62 00 00>