var Task = require('ember-cli/lib/models/task');
var Promise = require('ember-cli/lib/ext/promise');

module.exports = Task.extend({
  init: function() {
    this._context = {
      ui: this.ui,
      project: this.project,
      analytics: this.analytics,
      data: {}
    };

    var addons = this.project.addons;
    addons.forEach(this._mergePluginHooks.bind(this));
  },

  _deploymentHooks: {
    willDeploy: [],
    build: [],
    upload: [],
    activate: [],
    didDeploy: []
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
      return promise.then(fn.bind(null, context));
    }, Promise.resolve());
  },

  _mergePluginHooks: function(addon) {
    var keywords = addon.pkg.keywords;

    if (keywords.indexOf('ember-cli-deploy-plugin') > -1) {
      if (addon.createDeployPlugin && typeof addon.createDeployPlugin === 'function') {
        var deploymentHooks = this._deploymentHooks;
        var pluginNameRegex = /^(ember\-cli\-deploy\-)(.*)$/;
        var name            = addon.name.match(pluginNameRegex)[2];
        var pluginHooks     = addon.createDeployPlugin({name: name});

        Object.keys(deploymentHooks).forEach(function(hookName) {
          var fn = pluginHooks[hookName];

          if (fn) {
            deploymentHooks[hookName].push(fn);
          }
        });
      }
    }
  }
});

