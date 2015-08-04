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
      self._installedPlugins = self._discoverInstalledPlugins();

      var plugins;
      var configuredPluginList = deployConfig.plugins;
      if (configuredPluginList) {
        plugins = self._configuredPlugins(configuredPluginList, self._installedPlugins);
      } else {
        // no whitelist available, use all autodiscovered plugins
        plugins = self._installedPlugins;
      }

      Object.keys(plugins).forEach(function(pluginName) {
        self._registerPipelineHooks(plugins[pluginName], pluginName);
      });

      return deployConfig;
    });
  },

  _discoverInstalledPlugins: function(){
    var self = this;
    var installedPlugins = Object.create(null);
    (this.project.addons || []).forEach(function(addon){
      self._registerInstalledPlugin(addon, installedPlugins);
    });
    return installedPlugins;
  },

  _registerInstalledPlugin: function(addon, registry) {
    var self = this;

    if (this._isDeployPluginPack(addon)) {
      addon.addons.forEach(function(nestedAddon){
        self._registerInstalledPlugin(nestedAddon, registry);
      });
      return;
    }

    if (!this._isValidDeployPlugin(addon)) { return; }

    registry[this._pluginNameFromAddonName(addon)] = addon;
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

  _configuredPlugins: function(configuredPluginNames, availablePlugins) {
    var unavailablePlugins = Object.create(null);
    var configuredPlugins = Object.create(null);

    configuredPluginNames.forEach(function(configuredPluginKey) {
      var parts = configuredPluginKey.split(':', 2);
      var pluginName = parts[0];
      var configuredName = parts[1] ? parts[1] : parts[0];

      if (availablePlugins[pluginName]) {
        configuredPlugins[configuredName] = availablePlugins[pluginName];
      } else {
        unavailablePlugins[configuredName] = pluginName;
      }
    });

    if (Object.keys(unavailablePlugins).length !== 0) {
      this.ui.writeError(unavailablePlugins);
      var error = new SilentError('plugins configuration references plugins which are not available.');
      error.unavailablePlugins = unavailablePlugins;
      throw error;
    }

    return configuredPlugins;
  },

  _pluginNameFromAddonName: function(addon) {
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

