module.exports = {
  name: 'deploy:list',
  description: 'Lists the currently uploaded deploy-revisions',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' },
    { name: 'config-file', type: String, default: 'deploy.json' }
  ],

  run: function(commandOptions, rawArgs) {
    var ListTask = require('../tasks/list');
    var listTask = new ListTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return listTask.run(commandOptions);
  }
};
