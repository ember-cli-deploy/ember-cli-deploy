// reader = new EnvironmentReader(environment)
// reader.store.host
// reader.store.port

var path = require('path');

function ConfigurationReader(options) {
  var root              = process.cwd();
  var defaultConfigPath = 'deploy.json';

  this._options      = options || {};
  this._environment  = this._options.environment || 'development';
  this._deployConfig = this._options.configFile || defaultConfigPath;

  this._config  = require(path.join(root, this._deployConfig));
  
  this.store    = this._config[this._environment].store;
  this.assets   = this._config[this._environment].assets;
  this.buildEnv = this._config[this._environment].buildEnv || 'production';
  this.tagging  = this._config[this._environment].tagging || 'sha';
}

module.exports = ConfigurationReader;
