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
      environment: options.environment,
      configFile: options.configFile
    });

    var adapterType = config.store.type || 'redis';
    var taggingAdapterType = config.tagging || 'sha';
    var manifest = this.project.name();

    var adapterRegistry = new AdapterRegistry({ project: this.project });

    var Adapter = adapterRegistry
      .lookup('index', adapterType);

    var TaggingAdapter = adapterRegistry
      .lookup('tagging', taggingAdapterType)

    var taggingAdapter = new TaggingAdapter({
      manifest: manifest
    });

    var deploy = new Adapter({
      config: config.store,
      manifest: manifest,
      manifestSize: config.store.manifestSize,
      taggingAdapter: taggingAdapter,
      ui: ui
    });

    return readFile('dist/index.html')
      .then(function(fileContent) {
        ui.writeLine(chalk.blue('\nTrying to upload `dist/index.html`...\n'));
        return deploy.upload(fileContent);
      });
  }
});
