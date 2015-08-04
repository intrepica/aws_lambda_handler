Aws Lambda Handler
====================

About
--------------
Returns a lambda handler that when invoked with a Sns/dynamodb event and lambda context object, it will invoke the `eventHandler` with a parsed json message and a node callback. The `eventHandler` callback is an async.each `iterator` function. Each Record in the Sns will invoke the `eventHandler` until complete. If `eventHandler` calls back with an error and there is an `errorHandler` defined it will call it with the error and the callback.

[![Build Status](https://semaphoreci.com/api/v1/projects/e6e739a6-20de-4496-9af2-c28a43b3789d/483495/badge.svg)](https://semaphoreci.com/lp/aws_lambda_handler)    

See https://www.npmjs.com/package/aws_message_reader for more info on message parsing.

Example
--------------

```js

  'use strict';

  require('dotenv').load();

  var lambdaHandler = require('aws_lambda_handler');
  var intercom = require('intercom_init');
  var errorHandler = require('./error_handler');

  exports.handler = lambdaHandler(function eventHandler(message, callback) {
      intercom.createEvent(event, callback);
  }, errorHandler);

```

Optional error handler.

```js

  'use strict';
  var airbrake = require('airbrake').createClient("your api key");

  module.exports = function errorHandler(err, callback) {
    airbrake.notify(err, callback);
  };

```



```js

    var snsEvent = {
      "Records":[
        {
          "EventSource":"aws:sns",
          "EventVersion": "1.0",
          "EventSubscriptionArn": "arn:aws:sns:us-east-1:123456789012:lambda_topic:0b6941c3-f04d-4d3e-a66d-b1df00e1e381",
          "Sns":{
            "Type": "Notification",
            "MessageId":"95df01b4-ee98-5cb9-9903-4c221d41eb5e",
        "TopicArn":"arn:aws:sns:us-east-1:123456789012:lambda_topic",
            "Subject":"TestInvoke",
        "Message":" SOME STRINGIFIED JSON ",
            "Timestamp":"2015-04-02T07:36:57.451Z",
        "SignatureVersion":"1",
        "Signature":"r0Dc5YVHuAglGcmZ9Q7SpFb2PuRDFmJNprJlAEEk8CzSq9Btu8U7dxOu++uU",
            "SigningCertUrl":"http://sns.us-east-1.amazonaws.com/SimpleNotificationService-d6d679a1d18e95c2f9ffcf11f4f9e198.pem",
        "UnsubscribeUrl":"http://cloudcast.amazon.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:123456789012:example_topic:0b6941c3-f04d-4d3e-a66d-b1df00e1e381",
        "MessageAttributes":{"key":{"Type":"String","Value":"value"}}
          }
        }
      ]
    };

    // Simulate an aws lambda invocation
    handler(snsEvent, {
      succeed: function() {
        // yeah!!
      },
      fail: function(err) {
        blowUp(err); // :(        
      }

    })


```
