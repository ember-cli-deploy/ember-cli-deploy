var ConfigurationReader = require('../../utilities/configuration-reader');
var AdapterRegistry     = require('../../utilities/adapter-registry');
var Promise             = require('ember-cli/lib/ext/promise');
var Task                = require('ember-cli/lib/models/task');
var chalk               = require('chalk');
var fs                  = require('fs');

var readFile = Promise.denodeify(fs.readFile);

module.exports = Task.extend({
  run: function(options) {
    var ui = this.ui;
    var config = new ConfigurationReader({
      environment: options.environment
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

    return readFile('dist/index.html')
      .then(function(fileContent) {
        ui.writeLine(chalk.blue('\nTrying to upload `dist/index.html`...\n'));
        return deploy.upload(fileContent);
      });
  }
});
