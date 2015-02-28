var path      = require('path');
var Config    = require('../lib/models/config');
var deprecate = require('./deprecate');

function ConfigurationReader(options) {
  var root              = process.cwd();
  var defaultConfigPath = path.join('config', 'deploy.js');

  this._options = options || {};
  this._environment = this._options.environment || 'development';
  this._deployConfig = this._options.configFile || defaultConfigPath;

  var ui = options.ui;

  deprecate(
    "Using a .json file for deployment configuration is deprecated. Please use a .js file instead",
    /\.json$/.test(this._options.configFile),
    ui
  );
  try {
    var pathToConfig = path.join(root, this._deployConfig);
    this._config = require(pathToConfig);
  } catch(e) {
    ui.writeError(e);
    throw new Error('Cannot load configuration file \'' + pathToConfig + '\'. Note that the default location of the ember-cli-deploy config file is now \''+ defaultConfigPath + '\'');
  }
  this.config = new Config({
    project: this.project,
    rawConfig: this._config[this._environment]
  });
}

module.exports = ConfigurationReader;
