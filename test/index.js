'use strict';

var expect = require('expect.js');
var sinon = require('sinon');
var lambda = require('../');

var mock = sinon.mock;
var stub = sinon.stub;

describe('aws_lambda_handler', function(){
  var snsEvent, event, error;
        
  beforeEach(function() {
    event = {
      my_custom_event: {
        test:true
      }
    };
    snsEvent = {
      'Records':[
        {
          'EventSource': 'aws:sns',
          'Sns':{
            'Message': JSON.stringify(event)
          }
        }      
      ]
    };    
    
    error = new Error('Boom!');      
  });

  function context(callback) {
    return {
      succeed: function() {
        callback();
      },
      fail:function(err) {
        callback(err);
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

    describe('when unhandledException', function() {
      it('calls the context.fail callback', function(done) {
        var callback = stub();        
        var handler = lambda(callback);
        handler({}, context(function(err) {
          expect(err).to.eql(error);
          done();
        }));
      }); 
    });
  });


  describe('has errorHandler', function() {
    var errorHandler, callback;

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
    });

    describe('when unhandledException', function() {
      it('invokes errorHandler with the error and the callback', function(done) {        
        errorHandler.once().yields(error);
        var handler = lambda(callback, errorHandler);
        handler({}, context(function(err) {
          expect(err).to.eql(error);
          errorHandler.verify(); 
          done();
        }));
      }); 
    });
  });

});

