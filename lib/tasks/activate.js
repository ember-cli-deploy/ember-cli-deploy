var chalk               = require('chalk');
var Task                = require('ember-cli/lib/models/task');
var ConfigurationReader = require('../../utilities/configuration-reader');
var AdapterRegistry     = require('../../utilities/adapter-registry');
var Promise             = require('ember-cli/lib/ext/promise');
var SilentError         = require('ember-cli/lib/errors/silent');

var white = chalk.white;
var green = chalk.green;

module.exports = Task.extend({
  run: function(options) {
    var ui     = this.ui;
    var revision = options.revision;
    var config = new ConfigurationReader({
      environment: options.environment,
      configFile: options.configFile
    });
    var adapterType = config.store.type || 'redis';
    var Adapter = new AdapterRegistry({ project: this.project })
      .lookup('index', adapterType);

    var deploy = new Adapter({
      config: config.store,
      manifest: this.project.name(),
      manifestSize: config.store.manifestSize,
      ui: ui
    });

    return deploy.activate(revision);
  }
});
