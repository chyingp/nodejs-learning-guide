const readline = require('readline');

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

rl.question('Please input a word: ', function(answer){
	console.log('You have entered {%s}', answer.toUpperCase());
	rl.close();
});