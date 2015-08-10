var existsSync  = require('fs').existsSync;
var path        = require('path');

module.exports = {
  name: 'deploy',
  description: 'Deploys an ember-cli app',
  works: 'insideProject',

  anonymousOptions: [
    '<deployTarget>'
  ],

  availableOptions: [
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' },
    { name: 'activate', type: Boolean }
  ],

  run: function(commandOptions, rawArgs) {
    commandOptions.deployTarget = rawArgs.shift();
    process.env.DEPLOY_TARGET = commandOptions.deployTarget;

    var shouldActivate = this._shouldActivate(commandOptions);

    var PipelineTask = require('../tasks/pipeline');
    var pipeline = new PipelineTask({
      project: this.project,
      ui: this.ui,
      deployTarget: commandOptions.deployTarget,
      deployConfigPath: commandOptions.deployConfigFile,
      commandOptions: commandOptions,
      hooks: this._hooks(shouldActivate)
    });

    return pipeline.run();
  },

  _shouldActivate: function(options) {
    var config = this._pipelineConfig(options);
    var referToPipelineConfig = (options.activate === undefined);
    return referToPipelineConfig ? config.activateOnDeploy : options.activate;
  },

  _hooks: function(shouldActivate) {
    var hooks = ['configure',
      'willDeploy',
      'willBuild', 'build', 'didBuild',
      'willUpload', 'upload', 'didUpload',
      'willActivate', 'activate', 'didActivate',
      'didDeploy'
    ];

    if (!shouldActivate) {
      hooks.splice(hooks.indexOf('willActivate'), 3);
    }

    return hooks;
  },

  _pipelineConfig: function(options) {
    var root = this.project.root;
    var filePath = options.deployConfigFile;
    var fullPath = path.join(root, filePath);
    var deployTarget = options.deployTarget;

    if (!existsSync(fullPath)) {
      return {};
    }

    var fn = require(fullPath);

    return fn(deployTarget)['pipeline'] || {};
  }
};
