var Task        = require('ember-cli/lib/models/task');
var existsSync  = require('fs').existsSync;
var path        = require('path');
var PipelineTask = require('../tasks/pipeline');

module.exports = Task.extend({
  init: function() {
    this.commandOptions = this.commandOptions || {};
    this.shouldActivate = this.shouldActivate || this._shouldActivate(this.commandOptions);
  },

  run: function() {
    var pipeline = this._pipeline || new PipelineTask({
      project: this.project,
      ui: this.ui,
      deployTarget: this.deployTarget,
      deployConfigPath: this.deployConfigFile,
      commandOptions: this.commandOptions,
      hooks: this._hooks(this.shouldActivate)
    });
    return pipeline.run();
  },

  _shouldActivate: function(options) {
    var config = this._pipelineConfig();
    var referToPipelineConfig = (options.activate === undefined);
    return referToPipelineConfig ? config.activateOnDeploy : options.activate;
  },

  _hooks: function(shouldActivate) {
    var hooks = ['configure',
      'setup',
      'willDeploy',
      'willBuild', 'build', 'didBuild',
      'willPrepare', 'prepare', 'didPrepare',
      'willUpload', 'upload', 'didUpload',
      'willActivate', 'activate', 'didActivate',
      'didDeploy',
      'teardown'
    ];

    if (!shouldActivate) {
      hooks.splice(hooks.indexOf('willActivate'), 3);
    }

    return hooks;
  },

  _pipelineConfig: function() {
    var root = this.project.root;
    var filePath = this.deployConfigFile;
    var fullPath = path.join(root, filePath);
    var deployTarget = this.deployTarget;

    if (!existsSync(fullPath)) {
      return {};
    }

    var fn = require(fullPath);

    return fn(deployTarget)['pipeline'] || {};
  }

});
