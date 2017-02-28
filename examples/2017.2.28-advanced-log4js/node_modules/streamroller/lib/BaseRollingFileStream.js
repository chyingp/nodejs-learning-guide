"use strict";
var fs = require('fs')
, zlib = require('zlib')
, debug = require('debug')('streamroller:BaseRollingFileStream')
, util = require('util')
, stream = require('readable-stream');

module.exports = BaseRollingFileStream;

function BaseRollingFileStream(filename, options) {
  debug("In BaseRollingFileStream");
  this.filename = filename;
  this.options = options || {};
  this.options.encoding = this.options.encoding || 'utf8';
  this.options.mode = this.options.mode || parseInt('0644', 8);
  this.options.flags = this.options.flags || 'a';

  this.currentSize = 0;

  function currentFileSize(file) {
    var fileSize = 0;
    try {
      fileSize = fs.statSync(file).size;
    } catch (e) {
      // file does not exist
    }
    return fileSize;
  }

  function throwErrorIfArgumentsAreNotValid() {
    if (!filename) {
      throw new Error("You must specify a filename");
    }
  }

  throwErrorIfArgumentsAreNotValid();
  debug("Calling BaseRollingFileStream.super");
  BaseRollingFileStream.super_.call(this);
  this.openTheStream();
  this.currentSize = currentFileSize(this.filename);
}
util.inherits(BaseRollingFileStream, stream.Writable);

BaseRollingFileStream.prototype._write = function(chunk, encoding, callback) {
  var that = this;
  function writeTheChunk() {
    debug("writing the chunk to the underlying stream");
    that.currentSize += chunk.length;
    try {
      that.theStream.write(chunk, encoding, callback);
    }
    catch (err){
      debug(err);
      callback();
    }
  }

  debug("in _write");

  if (this.shouldRoll()) {
    this.currentSize = 0;
    this.roll(this.filename, writeTheChunk);
  } else {
    writeTheChunk();
  }
};

BaseRollingFileStream.prototype.openTheStream = function(cb) {
  debug("opening the underlying stream");
  var that = this;
  this.theStream = fs.createWriteStream(this.filename, this.options);
  this.theStream.on('error', function(err) {
    that.emit('error', err);
  });
  if (cb) {
    this.theStream.on("open", cb);
  }
};

BaseRollingFileStream.prototype.closeTheStream = function(cb) {
  debug("closing the underlying stream");
  this.theStream.end(cb);
};

BaseRollingFileStream.prototype.compress = function(filename, cb) {
    debug('Compressing ', filename, ' -> ', filename, '.gz');
    var gzip = zlib.createGzip();
    var inp = fs.createReadStream(filename);
    var out = fs.createWriteStream(filename+".gz");
    inp.pipe(gzip).pipe(out);

    out.on('finish', function(err) {
      debug('Removing original ', filename);
      fs.unlink(filename, cb);
    });
};

BaseRollingFileStream.prototype.shouldRoll = function() {
  return false; // default behaviour is never to roll
};

BaseRollingFileStream.prototype.roll = function(filename, callback) {
  callback(); // default behaviour is not to do anything
};
