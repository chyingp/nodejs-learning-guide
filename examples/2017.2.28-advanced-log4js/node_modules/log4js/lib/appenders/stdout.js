"use strict";

var layouts = require('../layouts');

function stdoutAppender(layout, timezoneOffset) {
  layout = layout || layouts.colouredLayout;
  return function(loggingEvent) {
    process.stdout.write(layout(loggingEvent, timezoneOffset) + '\n');
  };
}

function configure(config) {
  var layout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }
  return stdoutAppender(layout, config.timezoneOffset);
}

exports.appender = stdoutAppender;
exports.configure = configure;
