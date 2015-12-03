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

    var ReadConfigTask = require('../tasks/read-config');
    var readConfig = new ReadConfigTask({
      project: this.project,
      deployTarget: commandOptions.deployTarget,
      deployConfigFile: commandOptions.deployConfigFile
    });
    var self = this;
    return readConfig.run().then(function(config){
      var PipelineTask = require('../tasks/pipeline');
      var pipeline = new PipelineTask({
        project: self.project,
        ui: self.ui,
        config: config,
        deployTarget: commandOptions.deployTarget,
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
    });
  }
};
