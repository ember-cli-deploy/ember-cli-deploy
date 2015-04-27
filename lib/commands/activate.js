var ConfigurationReader = require('../utilities/configuration-reader');

module.exports = {
  name: 'deploy:activate',
  description: 'Activates a passed deploy-revision',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'revision', type: String },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  run: function(commandOptions, rawArgs) {
    var ActivateTask = require('../tasks/activate');
    var deployment = this._initDeploymentObject(commandOptions);

    var activateTask = new ActivateTask({
      deployment: deployment,
      analytics: this.analytics,
      project: this.project
    });

    return activateTask.run(commandOptions);
  },

  _initDeploymentObject: function(options) {
    var config = new ConfigurationReader({
      environment: options.environment,
      configFile: options.deployConfigFile,
      project: this.project,
      ui: this.ui
    }).config;

    return {
      ui: this.ui,
      config: config,
      data: {}
    }
  }
};
