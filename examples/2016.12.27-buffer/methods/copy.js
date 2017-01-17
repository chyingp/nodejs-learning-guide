var buff1 = Buffer.from([1, 2]);
var buff2 = Buffer.alloc(2);

buff1.copy(buff2);

console.log(buff2);  // <Buffer 01 02>