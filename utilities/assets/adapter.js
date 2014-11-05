var CoreObject = require('core-object');

var MethodNotImplementedException = function(message) {
  this.message = message;
  this.name = "MethodNotImplementedException"
};

module.exports = CoreObject.extend({
  upload: function() {
    throw new MethodNotImplementedException('You have to implement `#upload` in any subclass of AssetAdapter');
  }
});
