var path = require('path');
var Config = require('../lib/models/config');

function ConfigurationReader(options) {
  var root              = process.cwd();
  var defaultConfigPath = 'deploy.json';

  this._options = options || {};
  this._environment = this._options.environment || 'development';
  this._deployConfig = this._options.configFile || defaultConfigPath;

  this._config = require(path.join(root, this._deployConfig));
  this.config = new Config({
    project: this.project,
    rawConfig: this._config[this._environment]
  });
}

module.exports = ConfigurationReader;
