var Task        = require('ember-cli/lib/models/task');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');

var existsSync  = require('fs').existsSync;
var path        = require('path');

var Pipeline = require('../utilities/pipeline');

module.exports = Task.extend({
  init: function() {
    if (!this.project) {
      throw new SilentError('No project passed to pipeline task');
    }

    if (!this.ui) {
      throw new SilentError('No ui passed to pipeline task');
    }

    this._pipeline = this.pipeline || new Pipeline(this.hooks);

    this.project.addons.forEach(this._registerPipelineHooks.bind(this));

    var root = this.project.root;

    this.deployEnvironment = this.deployEnvironment || 'production';
    this.deployConfigPath  = this.deployConfigPath || 'config/deploy.js';
    this.configPath        = 'config/environment.js';

    if (!existsSync(this.deployConfigPath)) {
      throw new SilentError('Deploy config does not exist at `' + this.deployConfigPath + '`');
    }

    if (!existsSync(this.configPath)) {
      throw new SilentError('App config does not exist at `' + this.configPath + '`');
    }

    this._deployConfig = require(path.join(this.project.root, this.deployConfigPath))(this.deployEnvironment);

    var buildEnv = (this._deployConfig.build && this._deployConfig.build.buildEnv) || 'production';

    this._appConfig = require(path.join(this.project.root, this.configPath))(buildEnv);
  },

  run: function(hooks) {
    var pipeline = this._pipeline;
    var context = {
      ui: this.ui,
      project: this.project,
      config: this._deployConfig,
      appConfig: this._appConfig
    };

    return pipeline.execute({
      deployment: context
    });
  },

  _registerPipelineHooks: function(addon) {
    var isValidDeployPlugin = this._isValidDeployPlugin(addon);

    if (isValidDeployPlugin) {
      var pluginNameRegex = /^(ember\-cli\-deploy\-)(.*)$/;
      var name            = addon.name.match(pluginNameRegex)[2];
      var pluginHooks     = addon.createDeployPlugin({name: name});

      Object.keys(pluginHooks).forEach(function(hookName) {
        if (hookName !== 'name') {
          var fn = pluginHooks[hookName];

          if (typeof fn === 'function') {
            this._pipeline.register(hookName, fn.bind(pluginHooks));
          }
        }
      }.bind(this));
    }
  },

  _isValidDeployPlugin: function(addon) {
    var keywords = addon.pkg.keywords;
    var hasDeployKeyword = keywords.indexOf('ember-cli-deploy-plugin') > -1;
    var implementsDeploymentHooks = addon.createDeployPlugin && typeof addon.createDeployPlugin === 'function';

    return hasDeployKeyword && implementsDeploymentHooks;
  }
});

