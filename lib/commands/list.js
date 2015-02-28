module.exports = {
  name: 'deploy:list',
  description: 'Lists the currently uploaded deploy-revisions',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
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
