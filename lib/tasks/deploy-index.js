var ConfigurationReader = require('../utilities/configuration-reader');
var AdapterRegistry     = require('../utilities/adapter-registry');
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
      configFile: options.deployConfigFile,
      project: this.project,
      ui: ui
    }).config;

    var adapterType = config.get('store.type');
    var taggingAdapterType = config.get('tagging');
    var manifest = config.get('manifestPrefix');

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

    var indexFiles = config.get('indexFiles');

    if(indexFiles) {
      ui.writeLine(chalk.blue('\nUploading '+indexFiles.length+' files from `'+config.get('buildPath')+'`...\n'));
      return deploy.uploadFiles(indexFiles);
    } else {
      return readFile(config.get('buildPath')+'index.html')
        .then(function(fileContent) {
          ui.writeLine(chalk.blue('\nUploading `'+config.get('buildPath')+'index.html`...\n'));
          return deploy.upload(fileContent);
        });
    }
  }
});
