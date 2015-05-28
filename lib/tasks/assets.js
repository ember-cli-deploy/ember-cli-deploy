var Task                = require('ember-cli/lib/models/task');
var ConfigurationReader = require('../utilities/configuration-reader');
var Promise             = require('ember-cli/lib/ext/promise');
var fs                  = require('fs');
var path                = require('path');
var rimraf              = Promise.denodeify(require('rimraf'));
var glob                = Promise.denodeify(require('glob'));
var mkdirp              = require('mkdirp');

module.exports = Task.extend({
  run: function(options) {
    var broccoli  = require('broccoli');

    var self = this;
    return this.readConfiguration(options.environment, options.deployConfigFile).then(function(config){
      var fileTreeOrPath;
      if (config.get('assets.gzip') === false) {
        fileTreeOrPath = 'dist';
      } else {
        var gzipFiles = require('broccoli-gzip');

        fileTreeOrPath = gzipFiles('dist', {
          extensions: config.get('assets.gzipExtensions'),
          appendSuffix: false
        });
      }

      var builder = new broccoli.Builder(fileTreeOrPath);

      return builder.build()
        .then(self.processBuildResult.bind(self))
        .then(self.uploadAssets.bind(self, options.environment, options.deployConfigFile))
        .then(function() {
          builder.cleanup();
        });
    });
  },

  readConfiguration: function(environment, configFile){
    var self = this;
    return new ConfigurationReader({
      environment: environment,
      configFile: configFile,
      project: this.project,
      ui: this.ui
    }).read()
  },

  uploadAssets: function(environment, configFile) {
    var self = this;
    return this.readConfiguration(environment, configFile).then(function(config){
      var AssetsUploader = this.AssetsUploader;
      var assetsUploader = new AssetsUploader({
        ui: self.ui,
        config: config._materialize(),
        type: config.get('assets.type'),
        project: self.project
      });

      return assetsUploader.upload();
    });
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
