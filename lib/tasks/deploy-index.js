var ConfigurationReader = require('../../utilities/configuration-reader');
var Promise             = require('ember-cli/lib/ext/promise');
var SilentError         = require('ember-cli/lib/errors/silent');
var Task                = require('ember-cli/lib/models/task');
var chalk               = require('chalk');
var fs                  = require('fs');

var readFile = Promise.denodeify(fs.readFile);
var green    = chalk.green;
var white    = chalk.white;

module.exports = Task.extend({
  run: function(options) {
    var Deploy = require('deployinator');
    var ui = this.ui;
    var config = new ConfigurationReader({
      environment: options.environment
    });

    var deploy = new Deploy({
      storeConfig: config.store,
      manifest: this.project.name(),
      manifestSize: 10
    });

    return readFile('dist/index.html')
      .then(function(fileContent) {
        ui.writeLine(chalk.blue('\nTrying to upload `dist/index.html`...\n'));
        return deploy.upload(fileContent);
      })
      .then(function() {
        var successMessage = this.formatSuccessMessage(deploy);
        ui.writeLine(successMessage);
      }.bind(this))
      .catch(function(error) {
        var errorMessage = this.formatErrorMessage(error);
        return Promise.reject(new SilentError(errorMessage));
      }.bind(this));
  },

  formatErrorMessage: function(error) {
    var failure    = '\nUpload failed!\n\n';
    var suggestion = 'Did you try to upload a already uploaded SHA?\n\n';
    var solution   = 'Please run `'+green('ember deploy:list')+'` to ' +
                     'investigate.';

    return failure + error+ '\n\n' + white(suggestion) + white(solution);
  },

  formatSuccessMessage: function(deploy) {
    var success       = green('\nUpload successful!\n\n');
    var uploadMessage = white('Uploaded revision: ')+green(deploy.key);

    return success + uploadMessage;
  }
});
