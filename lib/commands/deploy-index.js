module.exports = {
  name: 'deploy:index',
  description: 'Deploys index to key-value store (default: redis)',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' },
    { name: 'config-file', type: String, default: 'deploy.json' }
  ],

  run: function(commandOptions, rawArgs) {
    var DeployIndexTask = require('../tasks/deploy-index');
    var deployIndexTask = new DeployIndexTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return deployIndexTask.run(commandOptions);
  }
};
