var Task        = require('ember-cli/lib/models/task');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('silent-error');

var existsSync  = require('fs').existsSync;
var path        = require('path');
var dotenv      = require('dotenv');

module.exports = Task.extend({
  init: function() {
    if (!this.project) {
      throw new SilentError('No project passed to read-config task');
    }

    if(!this.deployTarget) {
      throw new SilentError('No deployTarget passed to read-config task');
    }

    this.root = this.project.root;

    this.deployConfigPath  = this.deployConfigPath || 'config/deploy.js';

    if (!existsSync(path.join(this.root, this.deployConfigPath))) {
      throw new SilentError('Deploy config does not exist at `' + this.deployConfigPath + '`');
    }
  },

  run: function() {
    this._loadDotEnv();
    return this._readDeployConfig();
  },

  _loadDotEnv: function() {
    var root         = this.root;

    var deployDotEnvFilename = '.env.deploy.' + this.deployTarget;
    var deployDotEnvFilePath = path.join(root, deployDotEnvFilename);

    var dotEnvFilename = '.env';
    var dotEnvFilePath = path.join(root, dotEnvFilename);

    // order is important here. vars defined in files loaded first
    // will override files loaded after.
    var paths = [deployDotEnvFilePath, dotEnvFilePath];
    paths.forEach(function(path) {
      if (existsSync(path)) {
        dotenv.load({
          path: path
        });
      }
    });
  },

  _readDeployConfig: function() {
    var root         = this.root;
    var deployConfigFn  = require(path.resolve(root, this.deployConfigPath));
    return Promise.resolve(deployConfigFn(this.deployTarget));
  }
});
