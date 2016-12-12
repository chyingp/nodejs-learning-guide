var stream = require('stream');
var Writable = stream.Writable;
var util = require('util');

// function MyWritable(options) {
//   if (!(this instanceof MyWritable))
//     return new MyWritable(options);
//   Writable.call(this, options);
// }
// util.inherits(MyWritable, Writable);
var MyWritable = new Writable({
	write: function(chunk, encoding, callback){
		callback();
	}
});