var chalk = require('chalk');
var Promise = require('ember-cli/lib/ext/promise');
var SilentError         = require('silent-error');
var DeprecatedCommand = require('./deprecated-command');
var ActivateCommand = require('../activate');

module.exports = DeprecatedCommand({
  name: 'activate',
  description: 'Activate a deployed version of index.html',
  works: 'insideProject',

  anonymousOptions: [
    '<key>'
  ],

  availableOptions: [
    { name: 'environment', type: String, default: 'development' },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  run: function (commandOptions, rawArgs) {
    var key = rawArgs[0];
    if(!key) {
      var message = chalk.yellow('The `ember activate` command requires a deploy version to be specified.');
      return Promise.reject(new SilentError(message));
    }
    commandOptions.revision = key;
    return ActivateCommand.run.apply(this, arguments);
  }

});
