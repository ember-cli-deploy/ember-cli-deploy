var chalk       = require('chalk');
var SilentError = require('ember-cli/lib/errors/silent');

module.exports = function(command) {
  var description = command.description || '';
  command.description = chalk.red('[DEPRECATED] ') + description;
  command.run = function() {
    throw new SilentError('This command has been deprecated.  Please see `https://github.com/ember-cli/ember-cli-deploy` for details.');
  }

  return command;
};
