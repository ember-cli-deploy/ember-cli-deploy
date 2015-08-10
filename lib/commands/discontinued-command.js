var chalk       = require('chalk');

module.exports = function(name, description) {
  return {
    name: name,
    description: chalk.red('[DISCONTNUED] ') + description,
    works: 'insideProject',

    availableOptions: [],

    run: function(/* commandOptions, rawArgs */) {
      var message = chalk.red('This command has been discontinued. Please see `https://github.com/ember-cli/ember-cli-deploy` for details.\n');
      this.ui.writeLine(message, 'WARNING');
    }
  };
};
