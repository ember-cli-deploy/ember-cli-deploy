var Task        = require('ember-cli/lib/models/task');
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
      config: this.config,
      commandOptions: this.commandOptions,
      hooks: this._hooks(this.shouldActivate)
    });
    return pipeline.run();
  },

  _shouldActivate: function(options) {
    var pipelineConfig = this.config['pipeline'] || {};
    var shouldReferToPipelineConfig = (options.activate === undefined);
    return shouldReferToPipelineConfig ? pipelineConfig.activateOnDeploy : options.activate;
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
  }
});
