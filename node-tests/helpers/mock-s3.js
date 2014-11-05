var CoreObject = require('core-object');
var EventEmitter = require('events').EventEmitter;

var MockClient = function(options) {
  options = options || {};
  this.maxAsyncS3 = options.maxAsyncS3 || 20;
  this.s3Options = options.s3Options || {};
};

MockClient.prototype.uploadDir = function(params) {
  this.uploadParams = params;
  return this.ee;
};

module.exports = CoreObject.extend({
  init: function() {
    this.eventEmitter = new EventEmitter();
  },

  createClient: function(options) {
    var client = new MockClient(options);
    client.ee = this.eventEmitter;

    return client;
  }
});
