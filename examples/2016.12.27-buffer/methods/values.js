var buff = Buffer.from('hello');
var value;

for(var i = 0; i < buff.length; i++){
	console.log(buff[i]);
}

// 104
// 101
// 108
// 108
// 111

for(value of buff.values()){
	console.log(value);	
}

for(value of buff){
	console.log(value);		
}