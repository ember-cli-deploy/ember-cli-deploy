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

    var DeployTask = require('../tasks/deploy');
    var deploy = new DeployTask({
      project: this.project,
      ui: this.ui,
      deployTarget: commandOptions.deployTarget,
      deployConfigFile: commandOptions.deployConfigFile,
      commandOptions: commandOptions
    });

    return deploy.run();

  },

};
