var path        = require('path');
var deprecate   = require('./deprecate');
var Config      = require('../models/config');
var SilentError = require('silent-error');

function ConfigurationReader(options) {
  var root              = process.cwd();
  var defaultConfigPath = path.join('config', 'deploy.js');
  var environmentConfig;

  this._options      = options || {};
  this._environment  = this._options.environment || 'development';
  this._deployConfig = this._options.configFile || defaultConfigPath;

  var ui      = options.ui;
  var project = options.project;

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
    throw new SilentError('Cannot load configuration file \'' + pathToConfig + '\'. Note that the default location of the ember-cli-deploy config file is now \''+ defaultConfigPath + '\'');
  }

  environmentConfig = this._config[this._environment];

  if (!environmentConfig) {
    throw new SilentError('You are using the `' + this._environment + '` environment but have not specified any configuration.' +
      '\n\nPlease add a `' + this._environment + '` section to your `config/deploy.js` file.' +
      '\n\nFor more information, go to: `https://github.com/ember-cli/ember-cli-deploy#config-file`');
  }

  this.config = new Config({
    project: project,
    rawConfig: environmentConfig
  });
}

module.exports = ConfigurationReader;
