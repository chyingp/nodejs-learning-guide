"use strict";
var should = require('should')
, fs = require('fs')
, sandbox = require('sandboxed-module');

describe('BaseRollingFileStream', function() {
  describe('when no filename is passed', function() {
    it('should throw an error', function() {
      var BaseRollingFileStream = require('../lib/BaseRollingFileStream');
      (function() {
        new BaseRollingFileStream();
      }).should.throw();
    });
  });

  describe('default behaviour', function() {
    var stream;

    before(function() {
      var BaseRollingFileStream = require('../lib/BaseRollingFileStream');
      stream = new BaseRollingFileStream('basetest.log');
    });

    after(function(done) {
      fs.unlink('basetest.log', done);
    });

    it('should not want to roll', function() {
      stream.shouldRoll().should.eql(false);
    });

    it('should not roll', function() {
      var cbCalled = false;
      //just calls the callback straight away, no async calls
      stream.roll('basetest.log', function() { cbCalled = true; });
      cbCalled.should.eql(true);
    });

    it('should pass options to the underlying write stream', function() {
      var underlyingStreamOptions;

        var BaseRollingFileStream = sandbox.require(
          '../lib/BaseRollingFileStream',
          {
            requires: {
              'fs': {
                createWriteStream: function(filename, options) {
                  underlyingStreamOptions = options;
                  return {
                    on: function() {}
                  };
                }
              }
            }
          }
        );
        var stream = new BaseRollingFileStream('cheese.log', { encoding: 'utf904'});
        stream.openTheStream();

        underlyingStreamOptions.should.eql({ encoding: 'utf904', mode: 420, flags: 'a'});
    });
  });
});
