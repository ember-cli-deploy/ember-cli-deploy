var path                = require('path');
var commands            = require('./lib/commands');
var red                 = require('chalk').red;
var grey                = require('chalk').grey;
var hasDeprecatedConfig = require('./lib/utilities/detect-deprecated-config');

if (hasDeprecatedConfig()) {
    console.log(red('\n===========================================================================\n'));

    console.log(red('NOTICE TO USERS OF ember-cli-deploy VERSION <= 0.0.6\n\n'));

    console.log(grey('ember-cli/ember-cli-deploy') + red(' will now be using this npm module to host the\n'));
    console.log(red('offial Ember CLI deployment tool.\n\n'));

    console.log(red('Due to the changes being made, you should migrate your project to use the\n'));
    console.log(red('new module now.\n\n'));

    console.log(red('For more information on how to migrate from ') + grey('achambers/ember-cli-deploy') + red(' to ') + grey('ember-cli/ember-cli-deploy') + red(', please go to:\n\n'));

    console.log(red('https://github.com/ember-cli/ember-cli-deploy/blob/master/MIGRATION_STEPS.md'));

    console.log(red('\n===========================================================================\n'));
}

function Deploy() {
  this.name = "ember-cli-deploy"
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
