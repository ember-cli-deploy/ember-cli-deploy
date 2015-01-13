var CoreObject = require('core-object');
var execSync = require('execSync');

module.exports = CoreObject.extend({
  createTag: function() {
    var commandResult = execSync.exec("git rev-parse HEAD").stdout;

    this._generateKey(commandResult);

    return this.revisionKey;
  },

  _generateKey: function(sha) {
    this.revisionKey = this.manifest+':'+sha.slice(0,7);
  }
});
