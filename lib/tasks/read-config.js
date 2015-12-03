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

    if (!existsSync(this.deployConfigPath)) {
      throw new SilentError('Deploy config does not exist at `' + this.deployConfigPath + '`');
    }
  },

  run: function() {
    this._loadDotEnv();
    return this._readDeployConfig();
  },

  _loadDotEnv: function() {
    var root         = this.root;
    var dotEnvFilename = '.env.deploy.' + this.deployTarget;
    var dotEnvFilePath = path.join(root, dotEnvFilename);

    if (existsSync(dotEnvFilePath)) {
      dotenv.load({
        path: dotEnvFilename
      });
    }
  },

  _readDeployConfig: function() {
    var root         = this.root;
    var deployConfigFn  = require(path.resolve(root, this.deployConfigPath));
    return Promise.resolve(deployConfigFn(this.deployTarget));
  }
});
