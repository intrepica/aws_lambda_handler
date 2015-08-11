'use strict';

var messageReader = require('aws_message_reader');
var nodeifyLambda = require('nodeify_lambda_context');

module.exports = function(handler, errorHandler) { 
  return function(message, context) {
    var callback = nodeifyLambda(context);  

    try {      
      messageReader(message).each(function(record, cb) {
        handler(record, function(err) {
          if (err) {
            err.current_record = record;
            return cb(err);
          }
          cb();
        });
      }, onComplete);    
    } catch(err) {
      onComplete(err);
    }

    function onComplete(err) {
      if (err && errorHandler) {
        return errorHandler(err, callback);
      } else {
        return callback(err);
      }
    }
  };    
};