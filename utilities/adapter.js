var CoreObject  = require('core-object');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');

module.exports = CoreObject.extend({
  upload: function() {
    var message = 'You have to implement the `upload` method in a subclass ' +
                  'of Adapter!';

    return Promise.reject(new SilentError(message));
  }
});
