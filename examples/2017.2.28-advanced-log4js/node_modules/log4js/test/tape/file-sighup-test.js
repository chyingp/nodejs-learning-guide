"use strict";
var test = require('tape')
, sandbox = require('sandboxed-module');

test('file appender SIGHUP', function(t) {
  var closeCalled = 0
  , openCalled = 0
  , appender = sandbox.require(
    '../../lib/appenders/file',
    {
      'requires': {
        'streamroller': {
          'RollingFileStream': function() {
            this.openTheStream = function() {
              openCalled++;
            };

            this.closeTheStream = function(cb) {
              closeCalled++;
              cb();
            };

            this.on = function() {};
          }
        }
      }
    }
  ).appender('sighup-test-file');

  process.kill(process.pid, 'SIGHUP');
  t.plan(2);
  setTimeout(function() {
    t.equal(openCalled, 1, 'open should be called once');
    t.equal(closeCalled, 1, 'close should be called once');
    t.end();
  }, 10);
});
