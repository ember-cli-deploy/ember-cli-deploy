module.exports = {
  name: 'deploy:activate',
  description: 'Activates a passed deploy-revision',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'revision', type: String },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
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
