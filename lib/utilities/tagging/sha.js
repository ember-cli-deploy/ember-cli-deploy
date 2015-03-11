var CoreObject = require('core-object');

module.exports = CoreObject.extend({
  init: function() {
    this.syncExec = this.syncExec || require('sync-exec');
  },

  createTag: function() {
    var commandResult = this.syncExec("git rev-parse HEAD").stdout;
    return this._generateKey(commandResult);
  },

  _generateKey: function(sha) {
    this.revisionKey = this.manifest + ':' + sha.slice(0,7);
    return this.revisionKey;
  }
});
