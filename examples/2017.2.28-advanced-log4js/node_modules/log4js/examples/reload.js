"use strict";
var path = require('path')
, log4js = require('../lib/log4js');

log4js.configure(
  // config reloading only works with file-based config (obvs)
  path.join(__dirname, '../test/tape/test-config.json'),
  { reloadSecs: 10 }
);

log4js.getLogger('testing').info("Just testing");
log4js.shutdown(function() {
  //callback gets you notified when log4js has finished shutting down.
});
