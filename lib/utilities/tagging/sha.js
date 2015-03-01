var CoreObject = require('core-object');

module.exports = CoreObject.extend({
  createTag: function() {
    var commandResult;
    if (require('child_process').execSync) {
      commandResult = require('child_process').execSync("git rev-parse HEAD");
    } else {
      commandResult = require('execSync').exec("git rev-parse HEAD").stdout;
    }
    this._generateKey(commandResult);

    return this.revisionKey;
  },

  _generateKey: function(sha) {
    this.revisionKey = this.manifest+':'+sha.slice(0,7);
  }
});
