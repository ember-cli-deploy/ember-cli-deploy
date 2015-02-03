var CoreObject = require('core-object');
var exec = require('child_process').execSync || require('execSync').exec;

module.exports = CoreObject.extend({
  createTag: function() {
    var commandResult = exec("git rev-parse HEAD").stdout;

    this._generateKey(commandResult);

    return this.revisionKey;
  },

  _generateKey: function(sha) {
    this.revisionKey = this.manifest+':'+sha.slice(0,7);
  }
});
