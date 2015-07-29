'use strict';

var expect = require('expect.js');
var sinon = require('sinon');
var lambda = require('../');

var mock = sinon.mock;
var stub = sinon.stub;

describe('index', function(){
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

  describe('no errorHandler', function() {
    describe('when things are rosy', function() {
      it('calls the lambda handler for each message', function(done) {
        var callback = mock();
        callback.withArgs(event).yields(null);
        var handler = lambda(callback);
        handler(snsEvent, context(done));
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
  });


  describe('has errorHandler', function() {
    var errorHandler;

    beforeEach(function() {
      errorHandler = mock();    
    });
    
    describe('when handler invokes callback with an error', function() {
      it('calls the errorHandler with the error and the callback', function(done) {        
        var callback = stub();
        callback.yields(error);
        errorHandler.once().withArgs(error).yields(error);
        var handler = lambda(callback, errorHandler);
        handler(snsEvent, context(function(err) {        
          expect(err).to.eql(error);
          done();                  
        }));
      }); 
    });
  });

});
