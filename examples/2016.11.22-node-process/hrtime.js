var time = process.hrtime();

setInterval(() => {
  var diff = process.hrtime(time);

  console.log(`Benchmark took ${diff[0] * 1e9 + diff[1]} nanoseconds`);
}, 1000);