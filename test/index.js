'use strict';

var expect = require('expect.js');
var sinon = require('sinon');
var lambda = require('../');

var mock = sinon.mock;
var stub = sinon.stub;

describe('aws_lambda_handler', function() {
  var snsEvent;
  var event;
  var error;

  beforeEach(function() {
    event = {
      'my_custom_event': {
        'test': true
      }
    };
    snsEvent = {
      'Records': [
        {
          'EventSource': 'aws:sns',
          'Sns': {
            'Message': JSON.stringify(event)
          }
        }
      ]
    };
    error = new Error('Boom!');
  });

  function context(callback) {
    return {
      done: function(err, data) {
        callback(err, data);
      }
    };
  }

  describe('with no errorHandler', function() {
    describe('when things are rosy', function() {
      it('calls the lambda handler for each message', function(done) {
        var callback = mock();
        callback.withArgs(event).yields(null);
        var handler = lambda(callback);
        handler(snsEvent, context(function() {
          callback.verify();
          done();
        }));
      });
    });

    describe('when handler invokes callback with an error', function() {
      it('calls the context.fail callback', function(done) {
        var callback = stub();
        callback.yields(error);
        var handler = lambda(callback);
        handler(snsEvent, context(function(err) {
          expect(err).to.eql(error);
          done();
        }));
      });
    });

    describe('when the event doesnt contain Records', function() {
      describe('when handler invokes callback with a result', function() {
        it('calls context.succeed with the result', function(done) {
          var callback = stub();
          var result = {
            data: {
              name: 'test'
            }
          };
          callback.yields(null, result);
          var handler = lambda(callback);
          handler(result, context(function(err, data) {
            expect(data).to.eql(result);
            done();
          }));
        });
      });
    });
  });

  describe('has errorHandler', function() {
    var errorHandler;
    var callback;

    beforeEach(function() {
      errorHandler = mock();
      callback = stub();
    });

    describe('when handler invokes callback with an error', function() {
      it('invokes errorHandler with the error and the callback', function(done) {
        errorHandler.once().withArgs(error).yields(error);
        callback.yields(error);
        var handler = lambda(callback, errorHandler);
        handler(snsEvent, context(function(err) {
          expect(err).to.eql(error);
          errorHandler.verify();
          done();
        }));
      });

      it('attaches stringified lambda_event to error object', function(done) {
        errorHandler = stub();
        errorHandler.yields(error);
        callback.yields(error);
        var handler = lambda(callback, errorHandler);
        handler(snsEvent, context(function(err) {
          expect(err.lambda_event).to.eql(JSON.stringify(snsEvent));
          done();
        }));
      });

      it('attaches current_record to error object', function(done) {
        errorHandler = stub();
        errorHandler.yields(error);
        callback.yields(error);
        var handler = lambda(callback, errorHandler);
        handler(snsEvent, context(function(err) {
          expect(err.current_record).to.eql(event);
          done();
        }));
      });
    });
  });
});
