const fs = require('fs');

fs.createReadStream('./sample.txt').pipe(process.stdout);


