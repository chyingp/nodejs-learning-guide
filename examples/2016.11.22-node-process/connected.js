var child_process = require('child_process');

var child = child_process.fork('./connectedChild.js');

console.log( child.channel );
