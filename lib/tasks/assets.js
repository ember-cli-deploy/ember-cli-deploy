var Task                = require('ember-cli/lib/models/task');
var ConfigurationReader = require('../utilities/configuration-reader');
var Promise             = require('ember-cli/lib/ext/promise');
var fs                  = require('fs');
var path                = require('path');
var rimraf              = Promise.denodeify(require('rimraf'));
var glob                = Promise.denodeify(require('glob'));
var ncp                 = Promise.denodeify(require('ncp'));
var mkdirp              = require('mkdirp');

module.exports = Task.extend({
  run: function(options) {
    var broccoli  = require('broccoli');

    var config = new ConfigurationReader({
      environment: options.environment,
      configFile: options.deployConfigFile,
      project: this.project,
      ui: this.ui
    }).config;

    var fileTreeOrPath;
    if (config.get('assets.gzip') === false) {
      fileTreeOrPath = config.get('buildPath');
    } else {
      var gzipFiles = require('broccoli-gzip');

      fileTreeOrPath = gzipFiles(config.get('buildPath'), {
        extensions: config.get('assets.gzipExtensions'),
        appendSuffix: false
      });
    }

    var builder = new broccoli.Builder(fileTreeOrPath);

    return builder.build()
      .then(this.processBuildResult.bind(this, config))
      .then(this.uploadAssets.bind(this, options.environment, options.deployConfigFile))
      .then(function() {
        builder.cleanup();
      });
  },

  uploadAssets: function(environment, configFile) {
    var config = new ConfigurationReader({
      environment: environment,
      configFile: configFile,
      project: this.project,
      ui: this.ui
    }).config;

    var AssetsUploader = this.AssetsUploader;
    var assetsUploader = new AssetsUploader({
      ui: this.ui,
      config: config._materialize(),
      type: config.get('assets.type'),
      project: this.project
    });

    return assetsUploader.upload();
  },

  processBuildResult: function(config, results) {
    return this.clearOutputPath('tmp/assets-sync/')
    .then(function() {
      return this.copyToOutputPath(results.directory, 'tmp/assets-sync/');
    }.bind(this)).then(function(){
      return this.deleteExcluded('tmp/assets-sync/', config);
    }.bind(this));
  },

  clearOutputPath: function(outputPath) {
    if (!fs.existsSync(outputPath)) { return Promise.resolve(); }

    var entries = fs.readdirSync(outputPath);
    return Promise.map(entries, function(entry){
      return rimraf(path.join(outputPath, entry));
    });
  },

  copyToOutputPath: function(inputPath, outputPath) {
    if (!fs.existsSync(outputPath)) {
      mkdirp.sync(outputPath);
    }

    return ncp(inputPath, outputPath, {
      dereference: true,
      clobber: true,
      stopOnErr: true,
      limit: 2
    });
  },

  deleteExcluded: function(dir, config){
    var exclusions = config.get('assets.exclude');
    return Promise.map(exclusions, function(exclusion){
      return glob(exclusion, { cwd: dir, matchBase: true }).then(function(entries){
        return Promise.map(entries, function(entry) {
          return rimraf(path.join(dir, entry));
        });
      });
    });
  }
});
