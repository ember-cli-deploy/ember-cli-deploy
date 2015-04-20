module.exports = {
  name: 'deploy',
  description: 'Deploys an ember-cli app',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  run: function(commandOptions, rawArgs) {
    var ConfigurationReader = require('../utilities/configuration-reader');
    var config = new ConfigurationReader({
      environment: commandOptions.environment,
      configFile: commandOptions.deployConfigFile,
      project: this.project,
      ui: this.ui
    }).config;

    var buildEnv = config.get('buildEnv');

    var appConfig = new ConfigurationReader({
      environment: buildEnv,
      configFile: 'config/environment.js',
      project: this.project,
      ui: this.ui
    }).config;

    var PipelineTask = require('../tasks/pipeline');
    var pipeline = new PipelineTask({
      project: this.project,
      ui: this.ui,
      config: config,
      appConfig: appConfig
    });

    return pipeline.run();
  }
};
