"use strict";
var test = require('tape')
, path = require('path')
, sandbox = require('sandboxed-module');

test('Reload configuration shutdown hook', function(t) {
  var timerId
  , log4js = sandbox.require(
    '../../lib/log4js',
    {
      globals: {
        clearInterval: function(id) {
          timerId = id;
        },
        setInterval: function(fn, time) {
          return "1234";
        }
      }
    }
  );

  log4js.configure(
    path.join(__dirname, 'test-config.json'),
    { reloadSecs: 30 }
  );

  t.plan(1);
  log4js.shutdown(function() {
    t.equal(timerId, "1234", "Shutdown should clear the reload timer");
    t.end();
  });

});
