var obj = {
	nick: 'chyingp'
};

console.log(obj);  // 输出：{ nick: 'chyingp' }
console.dir(obj);  // 输出：{ nick: 'chyingp' }

var obj2 = {
	human: {
		man: {
			info: {
				nick: 'chyingp'
			}
		}
	}
};


console.log(obj2);  // 输出：{ human: { man: { info: [Object] } } }
console.dir(obj2);  // 输出：{ human: { man: { info: [Object] } } }

console.dir(obj2, {depth: 3});  // 输出：{ human: { man: { info: { nick: 'chyingp' } } } }