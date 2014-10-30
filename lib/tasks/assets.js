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

var EXPIRE_IN_2030 = new Date('2030');
var TWO_YEAR_CACHE_PERIOD_IN_SEC = 60 * 60 * 24 * 365 * 2;

module.exports = Task.extend({
  run: function(options) {
    var broccoli  = require('broccoli');
    var gzipFiles = require('broccoli-gzip');

    var gzipTree = gzipFiles('dist/assets', {
      extensions: ['js', 'css'],
      appendSuffix: false
    });
    var builder = new broccoli.Builder(gzipTree);

    return builder.build()
      .then(this.processBuildResult.bind(this))
      .then(this.uploadAssets.bind(this, options.environment))
      .then(function() {
        builder.cleanup();
      });
  },

  uploadAssets: function(environment) {
    var s3 = require('s3');
    var config = new ConfigurationReader({
      environment: environment
    });
    var client = s3.createClient({
      maxAsyncS3: 1, // concurrency is hard (and broken in node-s3)
      s3Options: config.assets
    });

    var ui = this.ui;
    ui.pleasantProgress.start(green('Uploading assets'), green('.'));

    return new Promise(function(resolve, reject){
      var params = {
        localDir: 'tmp/assets-sync',
        s3Params: {
          Bucket: config.assets.bucket,
          Prefix: 'assets/',
          ContentEncoding: 'gzip',
          CacheControl: 'max-age='+TWO_YEAR_CACHE_PERIOD_IN_SEC+', public',
          Expires: EXPIRE_IN_2030
        }
      };
      var uploader = client.uploadDir(params);

      uploader.on('error', function(err) {
        var errorMessage = 'Unable to sync: ' + err.stack;
        return Promise.reject(new SilentError(errorMessage));
      });
      uploader.on('fileUploadStart', function(fullPath, fullKey) {
        var fileNameMatches = fullPath.match(/\/(\w*[-]\w*[.]\w*)/);
        if (fileNameMatches) {
          ui.writeLine('Uploading: ' + green(fileNameMatches[1]));
        }
      });
      uploader.on('end', function() {
        ui.writeLine('Assets upload successful. Done uploading.');
        ui.pleasantProgress.stop();
        return resolve();
      });
    });
  },

  processBuildResult: function(results) {
    return this.clearOutputPath('tmp/assets-sync/')
    .then(function() {
      return this.copyToOutputPath(results.directory, 'tmp/assets-sync/');
    }.bind(this))
  },

  clearOutputPath: function(outputPath) {
    var rimraf = Promise.denodeify(require('rimraf'));
    if (!fs.existsSync(outputPath)) { return Promise.resolve();}

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
