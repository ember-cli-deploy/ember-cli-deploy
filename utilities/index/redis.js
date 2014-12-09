var Adapter = require('../adapter');
var RSVP    = require('rsvp');
var redis   = require('then-redis');

var DEFAULT_MANIFEST_SIZE   = 10;
var DEFAULT_TAGGING_ADAPTER = 'sha';

module.exports = Adapter.extend({
  init: function() {
    this.tagging      = this.tagging || DEFAULT_TAGGING_ADAPTER;
    this.manifestSize = this.manifestSize || DEFAULT_MANIFEST_SIZE;
    this.client       = redis.createClient(this.config);
  },

  upload: function(value) {
    var taggingAdapter = this.taggingAdapter || this._initTaggingAdapter();
    var key            = taggingAdapter.createTag();

    return this._upload(value, key);
  },

  list: function() {
    return this.client.lrange(this.manifest, 0, this.manifestSize - 1);
  },

  activate: function(revisionKey) {
    var uploadKey = this._currentKey();
    var that      = this;

    return new RSVP.Promise(function(resolve, reject) {
      that.list()
        .then(function(uploads) {
          return uploads.indexOf(revisionKey) > -1 ? resolve() : reject();
        })
        .then(function() {
          return that.client.set(uploadKey, revisionKey);
        })
        .then(resolve);
    });
  },

  current: function() {
    return this.client.get(this._currentKey());
  },

  _initTaggingAdapter: function() {
    var TaggingAdapter = require('../tagging/'+this.tagging);

    return new TaggingAdapter({
      manifest: this.manifest
    });
  },

  _upload: function(value, key) {
    return this._uploadIfNotAlreadyInManifest(value, key)
      .then(this._updateManifest.bind(this, this.manifest, key))
      .then(this._cleanUpManifest.bind(this))
      .then(function() { return key; });
  },

  _uploadIfNotAlreadyInManifest: function(value, key) {
    var that = this;

    return new RSVP.Promise(function(resolve, reject) {
      that.client.get(key)
        .then(function(result) {
          result === null ? resolve() : reject();
        })
        .then(function() {
          return that.client.set(key, value);
        })
        .then(resolve);
    });
  },

  _updateManifest: function(manifest, key) {
    return this.client.lpush(manifest, key);
  },

  _cleanUpManifest: function() {
    return this.client.ltrim(this.manifest, 0, this.manifestSize - 1);
  },

  _currentKey: function() {
    return this.manifest+':current';
  }
});
