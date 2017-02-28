"use strict";
var test = require('tape')
, layouts = require('../../lib/layouts')
, sandbox = require('sandboxed-module');

test('stdout appender', function(t) {
  var output = []
  , appender = sandbox.require(
    '../../lib/appenders/stdout',
    {
      globals: {
        process: { stdout: { write : function(data) { output.push(data); } } }
      }
    }
  ).appender(layouts.messagePassThroughLayout);

  appender({ data: ["cheese"] });
  t.plan(2);
  t.equal(output.length, 1, 'There should be one message.');
  t.equal(output[0], 'cheese\n', 'The message should be cheese.');
  t.end();
});
