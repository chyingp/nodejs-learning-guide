const {
    Worker, isMainThread, parentPort, workerData, threadId
  } = require('worker_threads');
  
  if (isMainThread) {
    module.exports = function stringify(script) {
      console.log(`[main thread] before processing, process.pid = ${process.pid}, thread id = ${threadId}, uid = ${script.uid}`);
      return new Promise((resolve, reject) => {
        const worker = new Worker(__filename, {
          workerData: script
        });
        worker.on('message', (result) => {
          console.log(`[main thread] message from worker[threadId = ${result.threadId}], process.pid = ${process.pid}, thread id = ${threadId}, uid = ${script.uid}`);
          resolve(result)
        });
        worker.on('error', reject);
        worker.on('exit', (code) => {
          if (code !== 0)
            reject(new Error(`Worker stopped with exit code ${code}`));
        });
      });
    };
  } else {
    const threadId = require('worker_threads').threadId;
    console.log(`\t[worker thread] start processing, process id = ${process.pid}, thread id = ${threadId}, uid = ${workerData.uid}`);
    
    function parse(jsonObj) {
      return JSON.stringify(jsonObj);
    }
    
    const script = workerData;
    parentPort.postMessage({ jsonStr: parse(script), threadId: threadId } );
    
    console.log(`\t[worker thread] finishing processing, process id = ${process.pid}, thread id = ${threadId}, uid = ${workerData.uid}`);
  }