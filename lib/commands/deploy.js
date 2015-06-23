var existsSync  = require('fs').existsSync;
var path        = require('path');

module.exports = {
  name: 'deploy',
  description: 'Deploys an ember-cli app',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' },
    { name: 'activate', type: Boolean }
  ],

  run: function(commandOptions, rawArgs) {
    process.env.DEPLOY_ENVIRONMENT = commandOptions.environment;

    var shouldActivate = this._shouldActivate(commandOptions);

    var PipelineTask = require('../tasks/pipeline');
    var pipeline = new PipelineTask({
      project: this.project,
      ui: this.ui,
      deployEnvironment: commandOptions.environment,
      deployConfigPath: commandOptions.deployConfigFile,
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
    var root     = this.project.root;
    var filePath = options.deployConfigFile;
    var fullPath = path.join(root, filePath);
    var env      = options.environment;

    if (!existsSync(fullPath)) {
      return {};
    }

    var fn = require(fullPath);

    return fn(env)['pipeline'] || {};
  }
};
