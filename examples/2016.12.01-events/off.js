var EventEmitter = require('events');

function wakeup(){
    console.log('man has woken up');
}

class Man extends EventEmitter {}

var man = new Man();

man.on('wakeup', wakeup);

man.emit('wakeup');

man.removeListener('wakeup', wakeup);

man.emit('wakeup');

