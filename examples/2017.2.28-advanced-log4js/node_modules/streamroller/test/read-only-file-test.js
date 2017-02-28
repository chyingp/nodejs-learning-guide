"use strict";
var should = require('should')
, fs = require('fs')
, path = require('path')
, streamroller = require('../lib/index.js');

describe('when the destination file is read-only', function() {
  var testFile = path.join(__dirname, 'read-only-file.log');
  before(function() {
      fs.writeFileSync(
        testFile,
        "Some test content"
      );
      fs.chmodSync(testFile, 292 /* 0o444 - octal literals not allowed in old node */);
  });

  it('should generate an error when writing', function(done) {
    var stream = new streamroller.RollingFileStream(testFile);
    stream.on('error', function(e) {
      e.code.should.eql('EACCES');
      done();
    });
  });

  after(function() {
    fs.unlinkSync(testFile);
  });
});
