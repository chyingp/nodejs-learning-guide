"use strict";
var test = require('tape')
, log4js = require('../../lib/log4js')
, net = require('net');

test('multiprocess appender shutdown (master)', function(t) {
  log4js.configure({
    appenders: [
      {
        type: "multiprocess",
        mode: "master",
        loggerPort: 12345,
        appender: { type: "stdout" }
      }
    ]
  });

  t.timeoutAfter(1000, "shutdown did not happen within 1000ms");
  setTimeout(function() {
    log4js.shutdown(function() {
      var connection = net.connect({ port: 12345 }, function() {
        t.fail("connection should not still work");
        t.end();
      }).on('error', function(err) {
        t.ok(err, 'we got a connection error');
        t.end();
      });
    });
  }, 500);
});
