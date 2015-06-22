module.exports = {
  name: 'deploy',
  description: 'Deploys an ember-cli app',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' },
    { name: 'activate', type: Boolean, default: false }
  ],

  run: function(commandOptions, rawArgs) {
    process.env.DEPLOY_ENVIRONMENT = commandOptions.environment;

    var commandLineArgs = {
      activateRevision: commandOptions.activate
    };

    var PipelineTask = require('../tasks/pipeline');
    var pipeline = new PipelineTask({
      project: this.project,
      ui: this.ui,
      deployEnvironment: commandOptions.environment,
      deployConfigPath: commandOptions.deployConfigFile,
      commandLineArgs: commandLineArgs,
      hooks: [
        'configure',
        'willDeploy',
        'willBuild', 'build', 'didBuild',
        'willUpload', 'upload', 'didUpload',
        'willActivate', 'activate', 'didActivate',
        'didDeploy'
      ]
    });

    return pipeline.run();
  }
};
