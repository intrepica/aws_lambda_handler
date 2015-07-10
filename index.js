'use strict';

var messageReader = require('aws_message_reader');
var nodeifyLambda = require('nodeify_lambda_context');

module.exports = function(handler, errorHandler) { 
	return function(message, context) {
		var callback = nodeifyLambda(context);
		
		messageReader(message).each(function(event, cb) {
			handler(event, cb);
		}, onComplete);

		function onComplete(err) {
			if (err && errorHandler) {
				return errorHandler(err, callback);
			}
			callback(err);
		}
	};		
};