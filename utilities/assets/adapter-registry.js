var CoreObject     = require('core-object');
var UnknownAdapter = require('./unknown');
var S3Adapter      = require('./s3');

var AssetAdapterRegistry = CoreObject.extend({
  lookup: function(adapterName) {
    var Adapter = this.adapters[adapterName];

    if (!Adapter) {
      return UnknownAdapter;
    } else {
      return Adapter;
    }
  },

  adapters: {
    "s3": S3Adapter
  }
});

module.exports = new AssetAdapterRegistry();
