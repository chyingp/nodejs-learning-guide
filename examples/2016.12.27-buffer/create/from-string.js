var buf = Buffer.from('this is a tést');  // 默认采用utf8

// 输出：this is a tést
console.log(buf.toString());

// 输出：this is a tC)st
console.log(buf.toString('ascii'));