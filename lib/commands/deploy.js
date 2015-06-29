var ConfigurationReader = require('../utilities/configuration-reader');
var AssetsUploader = require('../utilities/assets-uploader');

module.exports = {
  name: 'deploy',
  description: 'Deploys an ember-cli app',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  run: function(commandOptions, rawArgs) {
    var DeployIndexTask = require('../tasks/deploy-index');
    var AssetsTask      = require('../tasks/assets');
    var BuildTask       = this.tasks.Build;

    var config = new ConfigurationReader({
      environment: commandOptions.environment,
      configFile: commandOptions.deployConfigFile,
      project: this.project,
      ui: this.ui
    }).config;
    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    var buildOptions = {
      environment: config.get('buildEnv'),
      outputPath: config.get('buildPath'),
      watch: false,
      disableAnalytics: false
    };
    var assetsTask = new AssetsTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
      AssetsUploader: AssetsUploader
    });
    var deployIndexTask = new DeployIndexTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return buildTask.run(buildOptions)
      .then(function() {
        return assetsTask.run(commandOptions);
      })
      .then(function() {
        return deployIndexTask.run(commandOptions);
      });
  }
};
