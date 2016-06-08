'use strict';

var messageReader = require('aws_message_reader');

module.exports = function(handler, errorHandler) {
  return function(message, context) {
    messageReader(message).each(function(record, cb) {
      handler(record, function(err, result) {
        if (err) {
          err.current_record = record;
          return cb(err);
        }
        cb(null, result);
      });
    }, onComplete);

    function onComplete(err, result) {
      if (err && errorHandler) {
        return errorHandler(err, context.done);
      } else {
        return context.done(err, result);
      }
    }
  };
};