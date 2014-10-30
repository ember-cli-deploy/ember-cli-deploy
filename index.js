var commands = require('./lib/commands');

function Deploy() {
  this.name = "ember-deploy"
  return this;
}

Deploy.prototype.includedCommands = function() {
  return commands;
}

module.exports = Deploy;

