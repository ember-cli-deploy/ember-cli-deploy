module.exports = {
  name: 'deploy:activate',
  description: 'Activates a passed deploy-revision',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' },
    { name: 'revision', type: String },
    { name: 'config-file', type: String, default: 'deploy.json' }
  ],

  run: function(commandOptions, rawArgs) {
    var ActivateTask = require('../tasks/activate');
    var activateTask = new ActivateTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return activateTask.run(commandOptions);
  }
};
