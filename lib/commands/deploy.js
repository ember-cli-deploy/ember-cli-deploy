module.exports = {
  name: 'deploy',
  description: 'Deploys an ember-cli app',
  works: 'insideProject',

  anonymousOptions: [
    '<deployTarget>'
  ],

  availableOptions: [
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' },
    { name: 'verbose', type: Boolean },
    { name: 'activate', type: Boolean }
  ],

  run: function(commandOptions, rawArgs) {
    commandOptions.deployTarget = rawArgs.shift();
    this.ui.verbose = commandOptions.verbose;
    process.env.DEPLOY_TARGET = commandOptions.deployTarget;

    var ReadConfigTask = require('../tasks/read-config');
    var readConfig = new ReadConfigTask({
      project: this.project,
      deployTarget: commandOptions.deployTarget,
      deployConfigFile: commandOptions.deployConfigFile
    });
    var self = this;
    return readConfig.run().then(function(config){
      var DeployTask = require('../tasks/deploy');
      var deploy = new DeployTask({
        project: self.project,
        ui: self.ui,
        config: config,
        deployTarget: commandOptions.deployTarget,
        commandOptions: commandOptions
      });

      return deploy.run();
    });
  },

};
