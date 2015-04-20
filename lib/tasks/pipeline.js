var Task        = require('ember-cli/lib/models/task');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');

module.exports = Task.extend({
  init: function() {
    if (!this.project) {
      throw new SilentError('No project passed to pipeline task');
    }

    if (!this.config) {
      throw new SilentError('No deploy config passed to pipeline task');
    }

    if (!this.appConfig) {
      throw new SilentError('No app config passed to pipeline task');
    }

    if (!this.ui) {
      throw new SilentError('No ui passed to pipeline task');
    }

    this._deploymentHooks = {
      willDeploy: [],
      build: [],
      upload: [],
      activate: [],
      didDeploy: []
    };

    this._context = {
      ui: this.ui,
      project: this.project,
      config: this.config,
      appConfig: this.appConfig,
      data: {}
    };

    var addons = this.project.addons;
    addons.forEach(this._mergePluginHooks.bind(this));
  },

  run: function(hooks) {
    var context         = this._context;
    var deploymentHooks = this._deploymentHooks;

    hooks = hooks || Object.keys(deploymentHooks);

    return hooks.reduce(function(promise, hookName) {
      var hookPromise = this._executeHook.bind(this, hookName, context);
      return promise.then(hookPromise);
    }.bind(this), Promise.resolve());
  },

  _executeHook: function(hookName, context) {
    var pluginHooks = this._deploymentHooks[hookName];

    return pluginHooks.reduce(function(promise, fn) {
      return promise.then(function() {
        return fn(context);
      });
    }, Promise.resolve());
  },

  _mergePluginHooks: function(addon) {
    var isValidDeployPlugin = this._isValidDeployPlugin(addon);

    if (isValidDeployPlugin) {
      var deploymentHooks = this._deploymentHooks;
      var pluginNameRegex = /^(ember\-cli\-deploy\-)(.*)$/;
      var name            = addon.name.match(pluginNameRegex)[2];
      var pluginHooks     = addon.createDeployPlugin({name: name});

      Object.keys(deploymentHooks).forEach(function(hookName) {
        var fn = pluginHooks[hookName];

        if (fn) {
          deploymentHooks[hookName].push(fn.bind(pluginHooks));
        }
      });
    }
  },

  _isValidDeployPlugin: function(addon) {
    var keywords = addon.pkg.keywords;
    var hasDeployKeyword = keywords.indexOf('ember-cli-deploy-plugin') > -1;
    var implementsDeploymentHooks = addon.createDeployPlugin && typeof addon.createDeployPlugin === 'function';

    return hasDeployKeyword && implementsDeploymentHooks;
  }
});

