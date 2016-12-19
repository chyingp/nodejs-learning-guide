process.emitWarning('Something happened!');

process.emitWarning('Something Happened!', 'CustomWarning');

process.on('warning', (warning) => {
  console.warn(warning.name);
  console.warn(warning.message);
  console.warn(warning.stack);
});

const myWarning = new Error('Warning! Something happened!');
myWarning.name = 'CustomWarning';

process.emitWarning(myWarning);
// Emits: (node:56338) CustomWarning: Warning! Something Happened!