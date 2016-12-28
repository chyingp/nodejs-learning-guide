var array = 'buffer'.split('').map(function(v){
	return '0x' + v.charCodeAt(0).toString(16)
});

console.log( array.join() );
