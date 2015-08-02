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
      self._plugins = Object.create(null);
      (self.project.addons || []).forEach(function(addon){
        self._registerPlugin(addon);
      });

      var aliasHash = self._aliasHash(deployConfig, self._plugins);

      Object.keys(aliasHash).forEach(function(alias) {
        self._registerPipelineHooks(aliasHash[alias], alias);
      });

      return deployConfig;
    });
  },

  _registerPlugin: function(addon) {
    var self = this;

    if (this._isDeployPluginPack(addon)) {
      addon.addons.forEach(function(nestedAddon){
        self._registerPlugin(nestedAddon);
      });
      return;
    }

    if (!this._isValidDeployPlugin(addon)) { return; }

    this._plugins[this._pluginName(addon)] = addon;
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

  _aliasHash: function(deployConfig, plugins) {
    var aliasList = deployConfig.plugins;
    if(!aliasList) {
      // no whitelist available, autodiscover all the plugins
      aliasList = Object.keys(plugins);
    }


    var unavailablePlugins = Object.create(null);
    var aliasHash = Object.create(null);

    aliasList.forEach(function(alias) {
      var split = alias.split(':', 2);
      var pluginName = split[0];
      var configuredName = split[1] ? split[1] : split[0];

      aliasHash[configuredName] = plugins[pluginName];

      if(!aliasHash[configuredName]) {
        unavailablePlugins[configuredName] = pluginName;
      }
    });

    if(Object.keys(unavailablePlugins).length !== 0) {
      console.log(unavailablePlugins);
      var error = new SilentError('Configured alias for plugins, which are not available.');
      error.unavailablePlugins = unavailablePlugins;
      throw error;
    }

    return aliasHash;
  },

  _pluginName: function(addon) {
    var pluginNameRegex = /^(ember\-cli\-deploy\-)(.*)$/;
    return addon.name.match(pluginNameRegex)[2];
  },

  _registerPipelineHooks: function(addon, alias) {
    var self = this;
    var deployPlugin = addon.createDeployPlugin({name: alias});

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

