const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

// Buffer.from('你好') => <Buffer e4 bd a0 e5 a5 bd>
let str = decoder.write(Buffer.from([0xe4, 0xbd, 0xa0, 0xe5]));
console.log(str);  // 你

str = decoder.end();
console.log(str);  // �
console.log(Buffer.from(str));  // <Buffer ef bf bd>

// 官方文档的这段解释，跟没说差不多。。。
// Returns any remaining input stored in the internal buffer as a string. Bytes representing incomplete UTF-8 and UTF-16 characters will be replaced with substitution characters appropriate for the character encoding.