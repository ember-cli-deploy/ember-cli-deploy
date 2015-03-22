var Task = require('ember-cli/lib/models/task');

module.exports = Task.extend({
  init: function() {
    if (!this.project) { return; }

    this.project.addons.forEach(this._mergePluginsDeploymentsHooks.bind(this));
  },

  deploymentHooks: {
    willDeploy: [],
    build: [],
    update: [],
    activate: [],
    didDeploy: []
  },

  executeDeploymentHook: function(hookName, context) {
    this.deploymentHooks[hookName].forEach(function(hook) { hook(context); });
  },

  _mergePluginsDeploymentsHooks: function(addon) {
    if (addon.type === 'ember-deploy-addon') {
      for (hookName in addon.hooks) {
        var hookFunction = addon.hooks[hookName];
        this.deploymentHooks[hookName].push(hookFunction);
      }
    }
  }
});
