var Adapter     = require('../adapter');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');

module.exports = Adapter.extend({
  upload: function() {
    var errorMessage = 'You tried to use an unknown adapter: `' + this.name +
                       '`. Please pass a supported adapter-type.';
    return Promise.reject(new SilentError(errorMessage));
  }
});
