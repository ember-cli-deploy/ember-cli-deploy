var path        = require('path');
var deprecate   = require('./deprecate');
var Config      = require('../models/config');
var SilentError = require('silent-error');
var Promise     = require('ember-cli/lib/ext/promise');
var CoreObject  = require('core-object');

module.exports = CoreObject.extend({
  init: function() {
    var root = process.cwd();
    this.defaultConfigPath = path.join('config', 'deploy.js');
    var environmentConfig;
    this.environment =  this.environment || 'development';
    this.configFile = this.configFile || this.defaultConfigPath;
    this.pathToConfig = path.join(root, this.configFile);
  },
  read: function(){
    var self = this;
    var configResult;
    try {
      configResult = require(this.pathToConfig)(this.environment);
    } catch(e) {
      this.ui.writeError(e);
      return Promise.reject(new Error('Cannot load configuration file \'' + this.pathToConfig + '\'. Note that the default location of the ember-cli-deploy config file is now \''+ self.defaultConfigPath + '\''));
    }

    return Promise.resolve(configResult).then(function(config){
      if (!Object.keys(config).length) {
        throw new SilentError('You are using the `' + self.environment + '` environment but have not specified any configuration.' +
          '\n\nPlease add a `' + self.environment + '` section to your `config/deploy.js` file.' +
          '\n\nFor more information, go to: `https://github.com/ember-cli/ember-cli-deploy#config-file`');
      }
      return new Config({
        project: self.project,
        rawConfig: config
      });
    });
  }
});

