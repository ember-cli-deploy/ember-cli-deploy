var chalk       = require('chalk');
var SilentError = require('ember-cli/lib/errors/silent');

module.exports = function(command) {
  var description = command.description || '';
  command.description = chalk.red('[NO LONGER SUPPORTED] ') + description;
  command.run = function() {
    throw new SilentError('This command is no longer supported.  Please see `https://github.com/ember-cli/ember-cli-deploy` for details.');
  }

  return command;
};
