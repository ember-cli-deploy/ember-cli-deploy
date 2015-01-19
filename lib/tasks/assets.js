var Task                = require('ember-cli/lib/models/task');
var ConfigurationReader = require('../../utilities/configuration-reader');
var Promise             = require('ember-cli/lib/ext/promise');
var SilentError         = require('ember-cli/lib/errors/silent');
var chalk               = require('chalk');
var fs                  = require('fs');
var path                = require('path');

var ncp   = Promise.denodeify(require('ncp'));
var white = chalk.white;
var green = chalk.green;

var AssetsUploader = require('../../utilities/assets-uploader');

var EXPIRE_IN_2030 = new Date('2030');
var TWO_YEAR_CACHE_PERIOD_IN_SEC = 60 * 60 * 24 * 365 * 2;

module.exports = Task.extend({
  run: function(options) {
    var broccoli  = require('broccoli');

    var config = new ConfigurationReader({
      environment: options.environment,
      configFile: options.configFile
    });

    var fileTreeOrPath;
    if(config.assets.gzip === false) {
      fileTreeOrPath = 'dist';
    } else {
      var gzipFiles = require('broccoli-gzip');

      fileTreeOrPath = gzipFiles('dist', {
        extensions: config.assets.gzipExtensions ? config.assets.gzipExtensions : ['js', 'css', 'svg'],
        appendSuffix: false
      });
    }

    var builder = new broccoli.Builder(fileTreeOrPath);

    return builder.build()
      .then(this.processBuildResult.bind(this))
      .then(this.uploadAssets.bind(this, options.environment, options.configFile))
      .then(function() {
        builder.cleanup();
      });
  },

  uploadAssets: function(environment, configFile) {
    var config = new ConfigurationReader({
      environment: environment,
      configFile: configFile
    });
    var assetsUploader = new AssetsUploader({
      ui: this.ui,
      config: config,
      type: config.assets.type,
      project: this.project
    });

    return assetsUploader.upload();
  },

  processBuildResult: function(results) {
    return this.clearOutputPath('tmp/assets-sync/')
    .then(function() {
      return this.copyToOutputPath(results.directory, 'tmp/assets-sync/');
    }.bind(this))
  },

  clearOutputPath: function(outputPath) {
    var rimraf = Promise.denodeify(require('rimraf'));
    if (!fs.existsSync(outputPath)) { return Promise.resolve(); }

    var promises = [];
    var entries = fs.readdirSync(outputPath);

    for (var i = 0, l = entries.length; i < l; i++) {
      promises.push(rimraf(path.join(outputPath, entries[i])));
    }

    return Promise.all(promises);
  },

  copyToOutputPath: function(inputPath, outputPath) {
    var mkdirp = require('mkdirp');
    if (!fs.existsSync(outputPath)) {
      mkdirp.sync(outputPath);
    }

    return ncp(inputPath, outputPath, {
      dereference: true,
      clobber: true,
      stopOnErr: true,
      limit: 2
    });
  }
});
