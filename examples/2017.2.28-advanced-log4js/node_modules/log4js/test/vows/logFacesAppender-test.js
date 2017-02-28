"use strict";
var vows = require('vows'),
assert = require('assert'),
log4js = require('../../lib/log4js'),
sandbox = require('sandboxed-module');

var log = log4js.getLogger('lfstest');

function setupLogging(category, options) {
   var sent = {};

   function fake(event){
      Object.keys(event).forEach(function(key) {
         sent[key] = event[key];
      });
   }

   var lfsModule = require('../../lib/appenders/logFacesAppender');
   options.send = fake;
   log4js.clearAppenders();
   log4js.addAppender(lfsModule.configure(options), category);
   lfsModule.setContext("foo", "bar");
   lfsModule.setContext("bar", "foo");

   return {
      logger: log4js.getLogger(category),
      results: sent
   };
}

vows.describe('logFaces appender').addBatch({
   'when using HTTP receivers': {
      topic: function() {
         var setup = setupLogging('myCategory', {
            "type": "logFacesAppender",
            "application": "LFS-HTTP",
            "url": "http://localhost/receivers/rx1"
         });

         setup.logger.warn('Log event #1');
         return setup;
      },
      'an event should be sent': function (topic) {
         var event = topic.results;
         assert.equal(event.a, 'LFS-HTTP');
         assert.equal(event.m, 'Log event #1');
         assert.equal(event.g, 'myCategory');
         assert.equal(event.p, 'WARN');
         assert.equal(event.p_foo, 'bar');
         assert.equal(event.p_bar, 'foo');

         // Assert timestamp, up to hours resolution.
         var date = new Date(event.t);
         assert.equal(
            date.toISOString().substring(0, 14),
            new Date().toISOString().substring(0, 14)
         );
      }
   },

   'when using UDP receivers': {
      topic: function() {
         var setup = setupLogging('udpCategory', {
            "type": "logFacesAppender",
            "application": "LFS-UDP",
            "remoteHost": "127.0.0.1",
            "port": 55201
         });

         setup.logger.error('Log event #2');
         return setup;
      },
      'an event should be sent': function (topic) {
         var event = topic.results;
         assert.equal(event.a, 'LFS-UDP');
         assert.equal(event.m, 'Log event #2');
         assert.equal(event.g, 'udpCategory');
         assert.equal(event.p, 'ERROR');
         assert.equal(event.p_foo, 'bar');
         assert.equal(event.p_bar, 'foo');

         // Assert timestamp, up to hours resolution.
         var date = new Date(event.t);
         assert.equal(
            date.toISOString().substring(0, 14),
            new Date().toISOString().substring(0, 14)
         );
      }
   }


}).export(module);
