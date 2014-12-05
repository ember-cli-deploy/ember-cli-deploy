var Adapter = require('../adapter');
var RSVP = require('rsvp');
var redis = require('then-redis');

var DEFAULT_MANIFEST_SIZE = 10;

module.exports = Adapter.extend({
  init: function() {
    this.manifestSize = this.manifestSize || DEFAULT_MANIFEST_SIZE;
    this.client       = redis.createClient(this.config);
  },

  upload: function(value, key) {
    return this.uploadIfNotAlreadyInManifest(value, key)
      .then(this.updateManifest.bind(this, this.manifest, key))
      .then(this.cleanUpManifest.bind(this))
      .then(function() { return key; });
  },

  uploadIfNotAlreadyInManifest: function(value, key) {
    var that = this;

    return new RSVP.Promise(function(resolve, reject) {
      that.client.get(key)
        .then(function(result) {
          if (!result) {
            return that.client.set(key, value)
              .then(resolve.bind(null, key));
          } else {
            reject();
          }
        })
    });
  },

  updateManifest: function(manifest, key) {
    return this.client.lpush(manifest, key);
  },

  cleanUpManifest: function() {
    this.client.ltrim(this.manifest, 0, this.manifestSize - 1);
  }
});
