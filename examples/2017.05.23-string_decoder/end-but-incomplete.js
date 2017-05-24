const StringDecoder = require('string_decoder').StringDecoder;

// Buffer.from('好') => <Buffer e5 a5 bd>
let decoder = new StringDecoder('utf8');
let str = decoder.end( Buffer.from([0xe5]) );
console.log(str);  // �
console.log(Buffer.from(str));  // <Buffer ef bf bd>

decoder = new StringDecoder('utf8');
str = decoder.end( Buffer.from([0xa5]) );
console.log(str);  // �
console.log(Buffer.from(str));  // <Buffer ef bf bd>