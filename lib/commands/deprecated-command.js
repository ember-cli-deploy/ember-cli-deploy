var chalk       = require('chalk');

module.exports = function(command) {
  var description = command.description || '';
  command.description = chalk.red('[DEPRECATED] ') + description;

  var oldRun = command.run;
  command.run = function () {
    var message = chalk.red('This command has been deprecated.  Please see `https://github.com/ember-cli/ember-cli-deploy` for details.\n');
    this.ui.writeLine(message, 'WARNING');
    return oldRun.apply(this, arguments);
  };

  return command;
};
