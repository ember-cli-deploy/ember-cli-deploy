var path     = require('path');
var commands = require('./lib/commands');

function Deploy() {
  this.name = "ember-deploy"
  return this;
}

Deploy.prototype.includedCommands = function() {
  return commands;
}

Deploy.prototype.blueprintsPath = function() {
  return path.join(__dirname, 'blueprints');
},

module.exports = Deploy;

