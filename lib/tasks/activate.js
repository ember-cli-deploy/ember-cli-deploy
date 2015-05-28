var chalk               = require('chalk');
var Task                = require('ember-cli/lib/models/task');
var ConfigurationReader = require('../utilities/configuration-reader');
var AdapterRegistry     = require('../utilities/adapter-registry');
var Promise             = require('ember-cli/lib/ext/promise');
var SilentError         = require('silent-error');

var white = chalk.white;
var green = chalk.green;

module.exports = Task.extend({
  run: function(options) {
    var self = this;
    var ui = this.ui;
    var revision = options.revision;
    return new ConfigurationReader({
      environment: options.environment,
      configFile: options.deployConfigFile,
      project: this.project,
      ui: ui
    }).read().then(function(config){
      var adapterType = config.get('store.type');
      var Adapter = new AdapterRegistry({ project: self.project })
        .lookup('index', adapterType);

      var deploy = new Adapter({
        config: config.get('store'),
        manifest: self.project.name(),
        manifestSize: config.get('store.manifestSize'),
        ui: ui
      });

      return deploy.activate(revision);
    });
  }
});
