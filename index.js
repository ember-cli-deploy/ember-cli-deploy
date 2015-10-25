var path                = require('path');
var commands            = require('./lib/commands');

module.exports = {
  name: 'ember-cli-deploy',

  includedCommands: function() {
    return commands;
  },

  blueprintsPath: function() {
    return path.join(__dirname, 'blueprints');
  },

  postBuild: function(result) {
    if (!this.app) {
      // You will need ember-cli >= 1.13 to use ember-cli-deploy's postBuild integration.
      // This is because prior to 1.13, `this.app` is not available in the postBuild hook.
      return;
    }
    var options = this.app.options.emberCLIDeploy || {};

    var deployTarget = options.runOnPostBuild;
    if (deployTarget) {
      var DeployTask = require('./lib/tasks/deploy');
      var deploy = new DeployTask({
        project: this.project,
        ui: this.ui,
        deployTarget: deployTarget,
        deployConfigFile: options.configFile,
        shouldActivate: options.shouldActivate,
        commandOptions: {
          buildDir: result.directory
        }
      });

      return deploy.run();
    }
  }
};
