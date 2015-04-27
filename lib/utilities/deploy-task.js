var Task = require('ember-cli/lib/models/task');
var RSVP = require('rsvp');

module.exports = Task.extend({
  init: function() {
    if (!this.project) { return; }

    this._loadDeploymentAddons();
  },

  deploymentHooks: {
    willDeploy: [],
    build: [],
    upload: [],
    activate: [],
    didDeploy: [],
    discoverVersions: []
  },

  executeDeploymentHook: function(hookName, context) {
    var task = this;
    var promises = this.deploymentHooks[hookName].map(function(hook) {
      return hook.bind(task)(context);
    });

    return RSVP.all(promises);
  },

  _loadDeploymentAddons: function() {
    if (this.addonsLoaded) { return; }

    this.project.addons.forEach(this._mergePluginsDeploymentsHooks.bind(this));

    this.addonsLoaded = true; // init gets called twice
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
