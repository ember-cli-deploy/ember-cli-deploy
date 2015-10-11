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
