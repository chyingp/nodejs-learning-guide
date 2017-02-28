"use strict";
var should = require('should')
, fs = require('fs')
, zlib = require('zlib')
, streams = require('readable-stream')
, DateRollingFileStream
, testTime = new Date(2012, 8, 12, 10, 37, 11);

DateRollingFileStream = require('../lib').DateRollingFileStream;

function remove(filename, cb) {
  fs.unlink(filename, function() { cb(); });
}

function now() {
  return testTime.getTime();
}

describe('DateRollingFileStream', function() {
  describe('arguments', function() {
    var stream = new DateRollingFileStream(
      __dirname + '/test-date-rolling-file-stream-1',
      'yyyy-mm-dd.hh'
    );

    after(function(done) {
      remove(__dirname + '/test-date-rolling-file-stream-1', done);
    });

    it('should take a filename and a pattern and return a WritableStream', function() {
      stream.filename.should.eql(__dirname + '/test-date-rolling-file-stream-1');
      stream.pattern.should.eql('yyyy-mm-dd.hh');
      stream.should.be.instanceOf(streams.Writable);
    });

    it('with default settings for the underlying stream', function() {
      stream.theStream.mode.should.eql(420);
      stream.theStream.flags.should.eql('a');
      //encoding is not available on the underlying stream
      //assert.equal(stream.encoding, 'utf8');
    });
  });

  describe('default arguments', function() {
    var stream = new DateRollingFileStream(__dirname + '/test-date-rolling-file-stream-2');

    after(function(done) {
      remove(__dirname + '/test-date-rolling-file-stream-2', done);
    });

    it('should have pattern of .yyyy-MM-dd', function() {
      stream.pattern.should.eql('.yyyy-MM-dd');
    });
  });

  describe('with stream arguments', function() {
    var stream = new DateRollingFileStream(
      __dirname + '/test-date-rolling-file-stream-3',
      'yyyy-MM-dd',
      { mode: parseInt('0666', 8) }
    );


    after(function(done) {
      remove(__dirname + '/test-date-rolling-file-stream-3', done);
    });

    it('should pass them to the underlying stream', function() {
      stream.theStream.mode.should.eql(parseInt('0666', 8));
    });
  });

  describe('with stream arguments but no pattern', function() {
    var stream = new DateRollingFileStream(
      __dirname + '/test-date-rolling-file-stream-4',
      { mode: parseInt('0666', 8) }
    );

    after(function(done) {
      remove(__dirname + '/test-date-rolling-file-stream-4', done);
    });

    it('should pass them to the underlying stream', function() {
      stream.theStream.mode.should.eql(parseInt('0666', 8));
    });

    it('should use default pattern', function() {
      stream.pattern.should.eql('.yyyy-MM-dd');
    });
  });

  describe('with a pattern of .yyyy-MM-dd', function() {

    var stream;

    before(function(done) {
      stream = new DateRollingFileStream(
        __dirname + '/test-date-rolling-file-stream-5', '.yyyy-MM-dd',
        null,
        now
      );
      stream.write("First message\n", 'utf8', done);
    });

    after(function(done) {
      remove(__dirname + '/test-date-rolling-file-stream-5', done);
    });

    it('should create a file with the base name', function(done) {
      fs.readFile(__dirname + '/test-date-rolling-file-stream-5', 'utf8', function(err, contents) {
        contents.should.eql("First message\n");
        done(err);
      });
    });

    describe('when the day changes', function() {

      before(function(done) {
        testTime = new Date(2012, 8, 13, 0, 10, 12);
        stream.write("Second message\n", 'utf8', done);
      });

      after(function(done) {
        remove(__dirname + '/test-date-rolling-file-stream-5.2012-09-12', done);
      });

      describe('the number of files', function() {
        var files = [];

        before(function(done) {
          fs.readdir(__dirname, function(err, list) {
            files = list;
            done(err);
          });
        });

        it('should be two', function() {
          files.filter(
            function(file) {
              return file.indexOf('test-date-rolling-file-stream-5') > -1;
            }
          ).should.have.length(2);
        });
      });

      describe('the file without a date', function() {
        it('should contain the second message', function(done) {
          fs.readFile(
            __dirname + '/test-date-rolling-file-stream-5', 'utf8',
            function(err, contents) {
              contents.should.eql("Second message\n");
              done(err);
            }
          );
        });
      });

      describe('the file with the date', function() {
        it('should contain the first message', function(done) {
          fs.readFile(
            __dirname + '/test-date-rolling-file-stream-5.2012-09-12', 'utf8',
            function(err, contents) {
              contents.should.eql("First message\n");
              done(err);
            }
          );
        });
      });
    });
  });

  describe('with alwaysIncludePattern', function() {
    var stream;

    before(function(done) {
      testTime = new Date(2012, 8, 12, 0, 10, 12);
      remove(
        __dirname + '/test-date-rolling-file-stream-pattern.2012-09-12',
        function() {
          stream = new DateRollingFileStream(
            __dirname + '/test-date-rolling-file-stream-pattern',
            '.yyyy-MM-dd',
            { alwaysIncludePattern: true },
            now
          );
          stream.write("First message\n", 'utf8', done);
        }
      );
    });

    after(function(done) {
      remove(__dirname + '/test-date-rolling-file-stream-pattern.2012-09-12', done);
    });

    it('should create a file with the pattern set', function(done) {
      fs.readFile(
        __dirname + '/test-date-rolling-file-stream-pattern.2012-09-12', 'utf8',
        function(err, contents) {
          contents.should.eql("First message\n");
          done(err);
        }
      );
    });

    describe('when the day changes', function() {
      before(function(done) {
        testTime = new Date(2012, 8, 13, 0, 10, 12);
        stream.write("Second message\n", 'utf8', done);
      });

      after(function(done) {
        remove(__dirname + '/test-date-rolling-file-stream-pattern.2012-09-13', done);
      });


      describe('the number of files', function() {
        it('should be two', function(done) {
          fs.readdir(__dirname, function(err, files) {
            files.filter(
              function(file) {
                return file.indexOf('test-date-rolling-file-stream-pattern') > -1;
              }
            ).should.have.length(2);
            done(err);
          });
        });
      });

      describe('the file with the later date', function() {
        it('should contain the second message', function(done) {
          fs.readFile(
            __dirname + '/test-date-rolling-file-stream-pattern.2012-09-13', 'utf8',
            function(err, contents) {
              contents.should.eql("Second message\n");
              done(err);
            }
          );
        });
      });

      describe('the file with the date', function() {
        it('should contain the first message', function(done) {
          fs.readFile(
            __dirname + '/test-date-rolling-file-stream-pattern.2012-09-12', 'utf8',
            function(err, contents) {
              contents.should.eql("First message\n");
              done(err);
            }
          );
        });
      });
    });
  });

  describe('with compress option', function() {
    var stream;

    before(function(done) {
      testTime = new Date(2012, 8, 12, 0, 10, 12);
      stream = new DateRollingFileStream(
        __dirname + '/compressed.log',
        '.yyyy-MM-dd',
        { compress: true },
        now
      );
      stream.write("First message\n", 'utf8', done);
    });

    describe('when the day changes', function() {
      before(function(done) {
        testTime = new Date(2012, 8, 13, 0, 10, 12);
        stream.write("Second message\n", 'utf8', done);
      });

      it('should be two files, one compressed', function(done) {
        fs.readdir(__dirname, function(err, files) {
          var logFiles = files.filter(
            function(file) {
              return file.indexOf('compressed.log') > -1;
            }
          );
          logFiles.should.have.length(2);

          zlib.gunzip(
            fs.readFileSync(__dirname + '/compressed.log.2012-09-12.gz'),
            function(err, contents) {
              contents.toString('utf8').should.eql('First message\n');
              fs.readFileSync(__dirname + '/compressed.log','utf8').should.eql('Second message\n');
              done(err);
            }
          );
        });
      });
    });

    after(function(done) {
      remove(
        __dirname + '/compressed.log',
        function() {
          remove(__dirname + '/compressed.log.2012-09-12.gz', done);
        }
      );
    });

  });
});
