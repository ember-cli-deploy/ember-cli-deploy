var CoreObject           = require('core-object');
var assetAdapterRegistry = require('./assets/adapter-registry');

module.exports = CoreObject.extend({
  init: function() {
    var adapterName = this.type || 's3';
    var Adapter     = assetAdapterRegistry.lookup(adapterName);

    this.adapter = new Adapter({
      name: adapterName,
      ui: this.ui,
      config: this.config
    });
  },

  upload: function() {
    return this.adapter.upload();
  }
});
