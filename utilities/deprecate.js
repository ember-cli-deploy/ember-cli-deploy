'use strict';

var chalk = require('chalk');

module.exports = function(message, test, ui) {
  if (!test) { return; }

  ui.writeLine(chalk.yellow('DEPRECATION: ' + message));
};
