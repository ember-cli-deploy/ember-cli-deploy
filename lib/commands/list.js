module.exports = {
  name: 'deploy:list',
  description: 'Lists the currently uploaded deploy-revisions',
  works: 'insideProject',

  anonymousOptions: [
    '<deployTarget>'
  ],

  availableOptions: [
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' },
    { name: 'verbose', type: Boolean },
    { name: 'amount', type: Number, default: 10 }
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
        'fetchRevisions',
        'displayRevisions',
        'teardown'
      ]
    });

    return pipeline.run();
  }
};
