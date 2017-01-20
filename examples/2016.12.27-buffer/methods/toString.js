var buff = Buffer.from('hello');

console.log( buff.toString() );  // hello

console.log( buff.toString('utf8', 0, 2) );  // he