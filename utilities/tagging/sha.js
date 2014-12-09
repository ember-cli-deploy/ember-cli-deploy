var CoreObject = require('core-object');
var git        = require('gitty');

module.exports = CoreObject.extend({
  createTag: function() {
    var command              = new git.Command('./', 'rev-parse', [], 'HEAD');
    var executeSynchronously = true;

    command.exec(this._generateKey.bind(this), executeSynchronously);

    return this.revisionKey;
  },

  _generateKey: function(_error, sha, _stderr) {
    this.revisionKey = this.manifest+':'+sha.slice(0,7);
  }
});
