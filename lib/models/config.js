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

function setPath(config, propertyPath, value) {
  var parts = propertyPath.split('.');
  var lastPropertyPath = parts.pop()
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
  node[lastPropertyPath] = value;
}


module.exports = CoreObject.extend({
  init: function() {
    this._config = this.rawConfig;
    this._defaultPropertyPaths = {
      'assets.gzip': true,
      'assets.gzipExtensions': ['js', 'css', 'svg'],
      'assets.type': 's3',
      'buildEnv': 'production',
      'manifestPrefix': this.project.name(),
      'store.manifestSize': 10,
      'store.type': 'redis',
      'tagging': 'sha'
    };
  },

  // This is a temporary method to preserve an API where we are giving an
  // adapter a reference to the whole, raw config as a POJO. Remove it
  // once we move away from that
  _materialize: function(){
    var materialized = JSON.parse(JSON.stringify(this._config));
    var defaultPropertyPaths = this._defaultPropertyPaths;
    Object.keys(defaultPropertyPaths).forEach(function(propertyPath){
      if (!getPath(this._config, propertyPath)) {
        setPath(materialized, propertyPath, defaultPropertyPaths[propertyPath]);
      }
    });
    return materialized;
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
    return this._defaultPropertyPaths[propertyPath];
  }
});
