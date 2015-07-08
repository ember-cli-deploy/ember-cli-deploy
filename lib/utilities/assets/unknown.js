var Adapter     = require('../adapter');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('silent-error');

var errorMessage = function() {
  var errorMessage = 'You tried to use an unknown adapter: `' + this.name +
    '`. Please pass a supported adapter-type.';
  return Promise.reject(new SilentError(errorMessage));
}

module.exports = Adapter.extend({
  upload: errorMessage,
  activate: errorMessage,
  list: errorMessage,
  createTag: errorMessage
});
