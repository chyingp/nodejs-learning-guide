var EventEmitter = require('events');

class Man extends EventEmitter {}

var man = new Man();

man.emit('wakeup', 1);

man.on('wakeup', function(index){
    console.log('man has woken up ->' + index);
});

man.emit('wakeup', 2);