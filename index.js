var path                = require('path');
var commands            = require('./lib/commands');

function Deploy() {
  this.name = 'ember-cli-deploy';
  return this;
}

Deploy.prototype.includedCommands = function() {
  return commands;
};

Deploy.prototype.blueprintsPath = function() {
  return path.join(__dirname, 'blueprints');
};

Deploy.prototype.included = function(app) {
  var deployEnv  = this._deployEnvSetByDeployCommand();
  var root       = app.project.root;
  var configPath = path.join(root, 'config', 'deploy');
  var config;
  var fingerprint;

  if (deployEnv) {
    config = require(configPath)(deployEnv);

    if (config.fingerprint === false) {
      app.options.fingerprint = {enabled: false};
    } else {
      fingerprint = config.fingerprint || {};
      app.options.fingerprint = app.options.fingerprint || {};

      for (var option in fingerprint) {
        app.options.fingerprint[option] = fingerprint[option];
      }
    }
  }
};

Deploy.prototype._deployEnvSetByDeployCommand = function() {
  return process.env.DEPLOY_ENVIRONMENT;
}

module.exports = Deploy;
