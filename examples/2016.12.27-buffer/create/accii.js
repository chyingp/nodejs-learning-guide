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