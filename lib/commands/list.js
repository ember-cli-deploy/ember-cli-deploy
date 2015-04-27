var ConfigurationReader = require('../utilities/configuration-reader');

module.exports = {
  name: 'deploy:list',
  description: 'Lists the currently uploaded deploy-revisions',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  run: function(commandOptions, rawArgs) {
    var ListTask = require('../tasks/list');
    var deployment = this._initDeploymentObject(commandOptions);

    var listTask = new ListTask({
      deployment: deployment,
      analytics: this.analytics,
      project: this.project
    });

    return listTask.run();
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
