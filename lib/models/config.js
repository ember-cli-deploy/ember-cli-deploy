var CoreObject     = require('core-object');

function getPath(config, propertyPath) {
  var parts = propertyPath.split('.');
  function read(node, part){
    if (node) {
      return node[part];
    } else {
      return undefined;
    }
  }
  var node = config;
  var part = parts.shift()
  while (part !== undefined && part !== null) {
    node = read(node, part);
    part = parts.shift();
  }
  return node;
}


module.exports = CoreObject.extend({
  init: function() {
    this._config = this.rawConfig;
  },
  get: function(propertyPath) {
    var configValue = getPath(this._config, propertyPath);
    if (configValue === undefined) {
      return this.defaultFor(propertyPath);
    } else {
      return configValue;
    }
  },
  defaultFor: function(propertyPath) {
    switch(propertyPath) {
      case 'buildEnv':
        return 'production';
      case 'manifestPrefix':
        return this.project.name();
      case 'assets.gzip':
        return true;
      case 'assets.type':
        return 's3';
      case 'assets.gzipExtensions':
        return ['js', 'css', 'svg'];
      case 'store.type':
        return 'redis';
      case 'store.manifestSize':
        return 10;
      case 'tagging':
        return 'sha';
      default:
        return undefined;
    }
  }
});
