var chalk               = require('chalk');
var Task                = require('ember-cli/lib/models/task');
var ConfigurationReader = require('../../utilities/configuration-reader');
var AdapterRegistry     = require('../../utilities/adapter-registry');
var Promise             = require('ember-cli/lib/ext/promise');
var SilentError         = require('ember-cli/lib/errors/silent');

var white = chalk.white;
var green = chalk.green;

module.exports = Task.extend({
  run: function(options) {
    var ui     = this.ui;
    var revision = options.revision;
    var config = new ConfigurationReader({
      environment: options.environment
    });
    var adapterType = config.store.type || 'redis';
    var Adapter = new AdapterRegistry()
      .lookup('index', adapterType);

    var deploy = new Adapter({
      config: config.store,
      manifest: this.project.name(),
      manifestSize: config.store.manifestSize
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

    return deploy.activate(revision)
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
