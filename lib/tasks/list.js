var chalk               = require('chalk');
var Task                = require('ember-cli/lib/models/task');
var ConfigurationReader = require('../utilities/configuration-reader');
var AdapterRegistry     = require('../utilities/adapter-registry');

module.exports = Task.extend({
  run: function(options) {
    var ui = this.ui;
    var project = this.project;
    return new ConfigurationReader({
      environment: options.environment,
      configFile: options.deployConfigFile,
      project: this.project,
      ui: ui
    }).read().then(function(config){
      var adapterType = config.get('store.type');
      var Adapter = new AdapterRegistry({ project: project })
        .lookup('index', adapterType);

      var deploy = new Adapter({
        config: config.get('store'),
        manifest: project.name(),
        manifestSize: config.get('store.manifestSize'),
        ui: ui
      });

      return deploy.list();
    });
  }
});
