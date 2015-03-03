var DeprecatedCommand = require('./deprecated-command');

module.exports = DeprecatedCommand({
  name: 'deploy:index',
  description:  'Deploys index to key-value store (default: redis)',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  run: function(commandOptions, rawArgs) {
    var DeployIndexTask = require('../../tasks/deploy-index');
    var deployIndexTask = new DeployIndexTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return deployIndexTask.run(commandOptions);
  }
});
