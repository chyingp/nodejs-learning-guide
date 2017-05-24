const StringDecoder = require('string_decoder').StringDecoder;
const decoder = new StringDecoder('utf8');

// Buffer.from('你') => <Buffer e4 bd a0>
const str = decoder.write(Buffer.from([0xe4, 0xbd, 0xa0]));
console.log(str);  // 你
