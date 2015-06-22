module.exports = {
  name: 'deploy:activate',
  description: 'Activates a passed deploy-revision',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  anonymousOptions: [
    '<revision>'
  ],

  run: function(commandOptions, rawArgs) {
    process.env.DEPLOY_ENVIRONMENT = commandOptions.environment;

    var commandLineArgs = {
      revisionKey: rawArgs.shift(),
      activateRevision: true
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
        'willActivate',
        'activate',
        'didActivate'
      ]
    });

    return pipeline.run();
  }
};
