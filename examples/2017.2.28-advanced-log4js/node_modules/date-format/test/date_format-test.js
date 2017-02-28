"use strict";
var should = require('should')
, dateFormat = require('../lib');

describe('date_format', function() {
  var date = new Date(2010, 0, 11, 14, 31, 30, 5);

  it('should format a date as string using a pattern', function() {
    dateFormat.asString(dateFormat.DATETIME_FORMAT, date).should.eql("11 01 2010 14:31:30.005");
  });

  it('should default to the ISO8601 format', function() {
    dateFormat.asString(date).should.eql('2010-01-11 14:31:30.005');
  });

  it('should provide a ISO8601 with timezone offset format', function() {
    date.getTimezoneOffset = function() { return -660; };
    dateFormat.asString(
      dateFormat.ISO8601_WITH_TZ_OFFSET_FORMAT, 
      date
    ).should.eql(
      "2010-01-11T14:31:30+1100"
    );

    date.getTimezoneOffset = function() { return 120; };
    dateFormat.asString(
      dateFormat.ISO8601_WITH_TZ_OFFSET_FORMAT, 
      date
    ).should.eql(
      "2010-01-11T14:31:30-0200"
    );
  });

  it('should provide a just-the-time format', function() {
    dateFormat.asString(dateFormat.ABSOLUTETIME_FORMAT, date).should.eql('14:31:30.005');
  });

  it('should provide a custom format', function() {
    date.getTimezoneOffset = function() { return 120; };
    dateFormat.asString("O.SSS.ss.mm.hh.dd.MM.yy", date).should.eql('-0200.005.30.31.14.11.01.10');
  });
});
