var chalk               = require('chalk');
var Task                = require('ember-cli/lib/models/task');
var ConfigurationReader = require('../../utilities/configuration-reader');
var Promise             = require('ember-cli/lib/ext/promise');
var SilentError         = require('ember-cli/lib/errors/silent');

var white = chalk.white;
var green = chalk.green;

module.exports = Task.extend({
  run: function(options) {
    var Deploy = require('deployinator');
    var ui     = this.ui;
    var revision = options.revision;
    var config = new ConfigurationReader({
      environment: options.environment
    });
    var deploy = new Deploy({
      storeConfig: config.store,
      manifest: this.project.name(),
      manifestSize: 10
    });

    if (!revision) {
      var err = '\nError! Please pass a revision to `deploy:activate`.\n\n';
      var suggestion = 'Try to run `'+green('ember deploy:list')+'` '+
                       'and pass a revision listed there to `' +
                       green('ember deploy:activate')+'`.\n\nExample: \n\n'+
                       'ember deploy:activate --revision <manifest>:<sha>';
      var errorMessage = err + white(suggestion);

      return Promise.reject(new SilentError(errorMessage));
    }

    return deploy.setCurrent(revision)
      .then(function() {
        ui.writeLine(this.formatSuccessMessage());
      }.bind(this))
      .catch(function (error) {
        return Promise.reject(new SilentError(error));
      });
  },

  formatSuccessMessage: function() {
    var success = green('\nActivation successful!\n\n');
    var message = white('Please run `'+green('ember deploy:list')+'` to see '+
                        'what revision is current.');

    return success + message;
  }
});
