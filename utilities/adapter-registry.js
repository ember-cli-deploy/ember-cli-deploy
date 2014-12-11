var CoreObject     = require('core-object');
var UnknownAdapter = require('./assets/unknown');
var S3Adapter      = require('./assets/s3');
var RedisAdapter   = require('./index/redis');
var merge          = require('lodash-node/modern/objects/merge');

module.exports = CoreObject.extend({
  init: function() {
    if (!this.project) { return };

    this.project.addons.forEach(this._mergeDeployAdapters.bind(this));
  },

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
  },

  _mergeDeployAdapters: function(addon) {
    if (addon.type === 'ember-deploy-addon') {
      this.adapters = merge(this.adapters, addon.adapters);
    }
  }
});
