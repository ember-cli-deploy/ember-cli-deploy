var Task        = require('ember-cli/lib/models/task');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');

var Pipeline            = require('../utilities/pipeline');
var ConfigurationReader = require('../utilities/configuration-reader');

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

    this.deployEnvironment = this.deployEnvironment || 'production';
    this.deployConfigPath = this.deployConfigPath || 'config/deploy.js';

    this._config = new ConfigurationReader({
      environment: this.deployEnvironment,
      configFile: this.deployConfigPath,
      project: this.project,
      ui: this.ui
    }).config;

    var buildEnv = this._config.get('build.buildEnv') || 'production';

    this._appConfig = new ConfigurationReader({
      environment: buildEnv,
      configFile: 'config/environment.js',
      project: this.project,
      ui: this.ui
    }).config;
  },

  run: function(hooks) {
    var pipeline = this._pipeline;
    var context = {
      ui: this.ui,
      project: this.project,
      config: this._config,
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

