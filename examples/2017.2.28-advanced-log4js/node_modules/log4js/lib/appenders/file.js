"use strict";
var debug = require('debug')('log4js:file')
, layouts = require('../layouts')
, path = require('path')
, fs = require('fs')
, streams = require('streamroller')
, os = require('os')
, eol = os.EOL || '\n'
, openFiles = []
, levels = require('../levels');

//close open files on process exit.
process.on('exit', function() {
  debug('Exit handler called.');
  openFiles.forEach(function (file) {
    file.end();
  });
});

// On SIGHUP, close and reopen all files. This allows this appender to work with
// logrotate. Note that if you are using logrotate, you should not set
// `logSize`.
process.on('SIGHUP', function() {
  debug('SIGHUP handler called.');
  openFiles.forEach(function(writer) {
    writer.closeTheStream(writer.openTheStream.bind(writer));
  });
});

/**
 * File Appender writing the logs to a text file. Supports rolling of logs by size.
 *
 * @param file file log messages will be written to
 * @param layout a function that takes a logevent and returns a string
 *   (defaults to basicLayout).
 * @param logSize - the maximum size (in bytes) for a log file,
 *   if not provided then logs won't be rotated.
 * @param numBackups - the number of log files to keep after logSize
 *   has been reached (default 5)
 * @param options - options to be passed to the underlying stream
 * @param timezoneOffset - optional timezone offset in minutes (default system local)
 */
function fileAppender (file, layout, logSize, numBackups, options, timezoneOffset) {
  file = path.normalize(file);
  layout = layout || layouts.basicLayout;
  numBackups = numBackups === undefined ? 5 : numBackups;
  //there has to be at least one backup if logSize has been specified
  numBackups = numBackups === 0 ? 1 : numBackups;

  debug("Creating file appender (",
    file, ", ",
    logSize, ", ",
    numBackups, ", ",
    options, ", ",
    timezoneOffset, ")"
  );
  var writer = openTheStream(file, logSize, numBackups, options);

  // push file to the stack of open handlers
  openFiles.push(writer);

  return function(loggingEvent) {
    writer.write(layout(loggingEvent, timezoneOffset) + eol, "utf8");
  };

}

function openTheStream(file, fileSize, numFiles, options) {
  var stream = new streams.RollingFileStream(
    file,
    fileSize,
    numFiles,
    options
  );
  stream.on("error", function (err) {
    console.error("log4js.fileAppender - Writing to file %s, error happened ", file, err);
  });
  return stream;
}


function configure(config, options) {
  var layout;
  if (config.layout) {
    layout = layouts.layout(config.layout.type, config.layout);
  }

  if (options && options.cwd && !config.absolute) {
    config.filename = path.join(options.cwd, config.filename);
  }

  return fileAppender(
    config.filename,
    layout,
    config.maxLogSize,
    config.backups,
    config,
    config.timezoneOffset
  );
}

function shutdown(cb) {
  var completed = 0;
  var error;
  var complete = function(err) {
    error = error || err;
    completed++;
    if (completed >= openFiles.length) {
      cb(error);
    }
  };
  if (!openFiles.length) {
    return cb();
  }
  openFiles.forEach(function(file) {
    var stream = file;
    if (!stream.write(eol, "utf-8")) {
      stream.once('drain', function() {
        stream.end(complete);
      });
    } else {
      stream.end(complete);
    }
  });
}

exports.appender = fileAppender;
exports.configure = configure;
exports.shutdown = shutdown;
