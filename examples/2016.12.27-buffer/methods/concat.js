var buff1 = Buffer.alloc(10);
var buff2 = Buffer.alloc(20);

var totalLength = buff1.length + buff2.length;

console.log(totalLength);  // 30

var buff3 = Buffer.concat([buff1, buff2], totalLength);

console.log(buff3.length);  // 30

var buff4 = Buffer.from([1, 2]);
var buff5 = Buffer.from([3, 4]);

var buff6 = Buffer.concat([buff4, buff5], 5);

console.log(buff6.length);  // 
console.log(buff6);  // <Buffer 01 02 03 04 00>

var buff7 = Buffer.concat([buff4, buff5], 3);

console.log(buff7.length);  // 3
console.log(buff7);  // <Buffer 01 02 03>
