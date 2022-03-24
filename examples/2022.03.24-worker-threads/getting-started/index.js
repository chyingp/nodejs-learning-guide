const stringify = require('./json-util');

stringify({"uid": "10001"});
stringify({"uid": "10002"});

/*
    输出日志如下，当 worker 通过 postMessage 给主线程发消息，1、父线程受到消息，并进入父线程的回调；2、父线程回调结束，子线程继续执行（postMessage后的逻辑）
    [main thread] before processing, process.pid = 61000, thread id = 0, uid = 10001
    [main thread] before processing, process.pid = 61000, thread id = 0, uid = 10002
            [worker thread] start processing, process id = 61000, thread id = 1, uid = 10001
    [main thread] message from worker[threadId = 1], process.pid = 61000, thread id = 0, uid = 10001
            [worker thread] start processing, process id = 61000, thread id = 2, uid = 10002
    [main thread] message from worker[threadId = 2], process.pid = 61000, thread id = 0, uid = 10002
            [worker thread] finishing processing, process id = 61000, thread id = 1, uid = 10001
            [worker thread] finishing processing, process id = 61000, thread id = 2, uid = 10002    
*/