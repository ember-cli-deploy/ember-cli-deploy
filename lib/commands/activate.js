module.exports = {
  name: 'deploy:activate',
  description: 'Activates a passed deploy-revision',
  works: 'insideProject',

  availableOptions: [
    { name: 'revision', type: String, required: true },
    { name: 'verbose', type: Boolean },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  anonymousOptions: [
    '<deployTarget>'
  ],

  run: function(commandOptions, rawArgs) {
    commandOptions.deployTarget = rawArgs.shift();
    this.ui.verbose = commandOptions.verbose;
    process.env.DEPLOY_TARGET = commandOptions.deployTarget;

    var PipelineTask = require('../tasks/pipeline');
    var pipeline = new PipelineTask({
      project: this.project,
      ui: this.ui,
      deployTarget: commandOptions.deployTarget,
      deployConfigPath: commandOptions.deployConfigFile,
      commandOptions: commandOptions,
      hooks: [
        'configure',
        'setup',
        'willActivate',
        'activate',
        'didActivate',
        'teardown'
      ]
    });

    return pipeline.run();
  }
};
