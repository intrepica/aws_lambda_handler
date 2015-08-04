'use strict';

var messageReader = require('aws_message_reader');
var nodeifyLambda = require('nodeify_lambda_context');

module.exports = function(handler, errorHandler) { 
  return function(message, context) {
    var callback = nodeifyLambda(context);  

    try {      
      messageReader(message).each(function(event, cb) {
        handler(event, cb);
      }, onComplete);    
    } catch(err) {
      callbackError(err);
    }

    function onComplete(err) {      
      if (err && errorHandler) {
        return callbackError(err);
      }
      callback(err);
    }

    function callbackError(err) {
      if (errorHandler) {
        err.lambda_event = message;
        return errorHandler(err, callback);
      } else {
        return callback(err);
      }
    }
  };    
};