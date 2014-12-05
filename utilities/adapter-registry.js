var CoreObject     = require('core-object');
var UnknownAdapter = require('./assets/unknown');
var S3Adapter      = require('./assets/s3');

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
    },

    assets: {
      "s3": S3Adapter
    }
  }
});
