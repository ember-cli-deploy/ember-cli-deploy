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

    this.deployEnvironment = this.deployEnvironment || 'production';
    this.commandLineArgs = this.commandLineArgs || {};

    var dotEnvFilename = '.env.deploy.' + this.deployEnvironment;
    var dotEnvFilePath = path.join(root, dotEnvFilename);

    if (existsSync(dotEnvFilePath)) {
      dotenv.load({
        path: dotEnvFilename
      });
    }

    this.deployConfigPath  = this.deployConfigPath || 'config/deploy.js';
    this.appConfigPath        = 'config/environment.js';

    if (!existsSync(this.deployConfigPath)) {
      throw new SilentError('Deploy config does not exist at `' + this.deployConfigPath + '`');
    }

    if (!existsSync(this.appConfigPath)) {
      throw new SilentError('App config does not exist at `' + this.appConfigPath + '`');
    }
  },

  setup: function(){
    var self = this;
    return this._readConfig().then(function(configs){
      self.project.addons.forEach(function(addon){
        self._registerPipelineHooks(addon, configs.deployConfig.plugins);
      });
      return configs;
    });
  },

  run: function(hooks) {
    var pipeline        = this._pipeline;
    var ui              = this.ui;
    var project         = this.project;
    var self            = this;
    var commandLineArgs = this.commandLineArgs;

    return this.setup().then(function(configs){
      var context = {
        ui: ui,
        project: project,
        config: configs.deployConfig,
        appConfig: configs.appConfig,
        commandLineArgs: commandLineArgs
      };
      return pipeline.execute({
        deployment: context
      });
    });
  },

  _readConfig: function() {
    var project         = this.project;
    var appConfigPath   = this.appConfigPath;
    var deployConfigFn  = require(path.join(project.root, this.deployConfigPath));
    return Promise.resolve(deployConfigFn(this.deployEnvironment)).then(function(deployConfig){
      var buildEnv = (deployConfig.build && deployConfig.build.buildEnv) || 'production';
      var appConfigFn = require(path.join(project.root, appConfigPath));
      return {
        deployConfig: deployConfig,
        appConfig: appConfigFn(buildEnv)
      };
    });
  },

  _registerPipelineHooks: function(addon, configuredPluginList) {
    var isValidDeployPlugin = this._isValidDeployPlugin(addon);
    if (!isValidDeployPlugin) { return; }

    var pluginNameRegex = /^(ember\-cli\-deploy\-)(.*)$/;
    var name            = addon.name.match(pluginNameRegex)[2];
    if (configuredPluginList && configuredPluginList.indexOf(name) === -1) {
      return;
    }

    var deployPlugin = addon.createDeployPlugin({name: name});

    this._hookNames().forEach(function(hookName) {
      var fn         = deployPlugin[hookName];
      var pluginName = (typeof deployPlugin.name === 'function') ? deployPlugin.name() : deployPlugin.name;

      if (typeof fn === 'function') {
        var fnObject = {
          name: pluginName,
          fn: fn.bind(deployPlugin)
        };

        this._pipeline.register(hookName, fnObject);
      }
    }.bind(this));
  },

  _isValidDeployPlugin: function(addon) {
    var keywords = addon.pkg.keywords;
    var hasDeployKeyword = keywords.indexOf('ember-cli-deploy-plugin') > -1;
    var implementsDeploymentHooks = addon.createDeployPlugin && typeof addon.createDeployPlugin === 'function';

    return hasDeployKeyword && implementsDeploymentHooks;
  },

  _hookNames: function() {
    return this._pipeline.hookNames();
  }
});

