var Task        = require('ember-cli/lib/models/task');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');

var existsSync  = require('fs').existsSync;
var path        = require('path');
var dotenv      = require('dotenv');

var Pipeline = require('../utilities/pipeline');

module.exports = Task.extend({
  init: function() {
    if (!this.project) {
      throw new SilentError('No project passed to pipeline task');
    }

    if (!this.ui) {
      throw new SilentError('No ui passed to pipeline task');
    }

    this._pipeline = this.pipeline || new Pipeline(this.hooks, {
      ui: this.ui
    });

    var root = this.project.root;

    this.deployTarget = this.deployTarget || 'production';
    this.commandOptions = this.commandOptions || {};

    var dotEnvFilename = '.env.deploy.' + this.deployTarget;
    var dotEnvFilePath = path.join(root, dotEnvFilename);

    if (existsSync(dotEnvFilePath)) {
      dotenv.load({
        path: dotEnvFilename
      });
    }

    this.deployConfigPath  = this.deployConfigPath || 'config/deploy.js';

    if (!existsSync(this.deployConfigPath)) {
      throw new SilentError('Deploy config does not exist at `' + this.deployConfigPath + '`');
    }
  },

  setup: function(){
    var self = this;
    return this._readDeployConfig().then(function(deployConfig){
      self.project.addons.forEach(function(addon){
        self._registerPipelineHooks(addon, deployConfig);
      });
      return deployConfig;
    });
  },

  run: function(hooks) {
    var self           = this;
    var pipeline       = this._pipeline;
    var ui             = this.ui;
    var project        = this.project;
    var commandOptions = this.commandOptions;

    return this.setup().then(function(deployConfig){
      var context = {
        commandOptions: commandOptions,
        config: deployConfig,
        deployTarget: self.deployTarget,
        project: project,
        ui: ui
      };
      return pipeline.execute(context);
    });
  },

  _readDeployConfig: function() {
    var project         = this.project;
    var deployConfigFn  = require(path.join(project.root, this.deployConfigPath));
    return Promise.resolve(deployConfigFn(this.deployTarget));
  },

  _registerPipelineHooks: function(addon, deployConfig) {
    var self = this;
    var configuredPluginList = deployConfig.plugins;

    if (this._isDeployPluginPack(addon)) {
      addon.addons.forEach(function(nestedAddon){
        self._registerPipelineHooks(nestedAddon, deployConfig);
      });
      return;
    }

    if (!this._isValidDeployPlugin(addon)) { return; }

    var pluginNameRegex = /^(ember\-cli\-deploy\-)(.*)$/;
    var name            = addon.name.match(pluginNameRegex)[2];
    if (configuredPluginList && configuredPluginList.indexOf(name) === -1) {
      return;
    }

    var deployPlugin = addon.createDeployPlugin({name: name});

    this._pipeline.hookNames().forEach(function(hookName) {
      var fn = deployPlugin[hookName];
      if (typeof fn !== 'function') {
        return;
      }

      this._pipeline.register(hookName, {
        name: deployPlugin.name,
        fn: function(context){
          if (deployPlugin.beforeHook &&  typeof deployPlugin.beforeHook === 'function') {
            deployPlugin.beforeHook(context);
          }
          return fn.call(deployPlugin, context);
        }
      });
    }.bind(this));
  },

  _isDeployPluginPack: function(addon) {
    return this._addonHasKeyword(addon, 'ember-cli-deploy-plugin-pack');
  },

  _isValidDeployPlugin: function(addon) {
    return this._addonHasKeyword(addon, 'ember-cli-deploy-plugin')
        && this._addonImplementsDeploymentHooks(addon);
  },

  _addonHasKeyword: function(addon, keyword) {
    var keywords = addon.pkg.keywords;
    return keywords.indexOf(keyword) > -1;
  },

  _addonImplementsDeploymentHooks: function(addon) {
    return addon.createDeployPlugin && typeof addon.createDeployPlugin === 'function';
  }
});

