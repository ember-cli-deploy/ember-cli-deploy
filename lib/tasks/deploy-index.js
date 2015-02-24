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
      configFile: options.deployConfigFile
    }).config;

    var adapterType = config.get('store.type');
    var taggingAdapterType = config.get('tagging');
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
      config: config.get('store'),
      manifest: manifest,
      manifestSize: config.get('store.manifestSize'),
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
