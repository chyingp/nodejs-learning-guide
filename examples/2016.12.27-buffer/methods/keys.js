var buff = Buffer.from('abcde');

for(const key of buff.keys()){
	console.log('key is %d', key);
}
// key is 0
// key is 1
// key is 2
// key is 3
// key is 4

for(const value of buff.values()){
	console.log('value is %d', value);
}
// value is 97
// value is 98
// value is 99
// value is 100
// value is 101

for(const pair of buff.entries()){
	console.log('buff[%d] === %d', pair[0], pair[1]);
}
// buff[0] === 97
// buff[1] === 98
// buff[2] === 99
// buff[3] === 100
// buff[4] === 101