const readline = require('readline');
const fs = require('fs');

function completer(line) {
  const completions = '.help .error .exit .quit .q'.split(' ');
  const hits = completions.filter((c) => { return c.indexOf(line) === 0 });
  // show all completions if none found
  return [hits.length ? hits : completions, line];
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  completer: completer
});

rl.prompt();

// rl.on('line', (line) => {
//   console.log(`Line from file: ${line}`);
// });