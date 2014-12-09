var CoreObject        = require('core-object');
var UnknownAdapter    = require('./assets/unknown');
var S3Adapter         = require('./assets/s3');
var RedisAdapter      = require('./index/redis');
var ShaTaggingAdapter = require('./tagging/sha');

module.exports = CoreObject.extend({
  lookup: function(type, adapterName) {
    var Adapter = this.adapters[type][adapterName];

    if (!Adapter) {
      return UnknownAdapter;
    } else {
      return Adapter;
    }
  },

  adapters: {
    index: {
      "redis": RedisAdapter
    },

    assets: {
      "s3": S3Adapter
    }
  }
});
