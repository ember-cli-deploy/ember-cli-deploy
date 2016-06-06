var CoreObject  = require('core-object');
var DAG         = require('ember-cli/lib/utilities/DAG');
var SilentError = require('silent-error');
var chalk       = require('chalk');
var _           = require('lodash-node');

module.exports = CoreObject.extend({
  init: function(project, ui, config) {
    this._project        = project;
    this._ui             = ui;
    this._aliasConfig    = (config.pipeline && config.pipeline.alias) || {};
    this._runOrderConfig = (config.pipeline && config.pipeline.runOrder) || {};
    this._disabledConfig = (config.pipeline && config.pipeline.disabled) || {};
  },

  plugins: function() {
    var allEmberCliAddons = this._project.addons || [];
    var validAddons       = this._validAddons(allEmberCliAddons);
    var aliasMap          = this._buildAliasMap(validAddons, this._aliasConfig);
    var disabledMap       = this._buildDisabledMap(aliasMap, this._disabledConfig);
    var installedPlugins  = this._installedPlugins(validAddons, aliasMap);
    var runOrderMap       = this._buildRunOrderMap(this._runOrderConfig, aliasMap, validAddons, installedPlugins);
    var enabledPlugins    = this._applyDisabledConfig(installedPlugins, disabledMap);
    var orderedPlugins    = this._applyRunOrderConfig(enabledPlugins, runOrderMap);

    if (orderedPlugins.length === 0) {
      this._ui.writeError('\nWARNING: No plugins installed/enabled\n');
      this._ui.writeError('ember-cli-deploy works by registering plugins in it\'s pipeline.\n');
      this._ui.writeError('In order to execute a deployment you must install at least one ember-cli-deploy compatible plugin.\n');
      this._ui.writeError('Visit http://ember-cli-deploy.github.io/ember-cli-deploy/docs/v0.6.x/plugins/ for a list of supported plugins.\n');
    }

    return orderedPlugins;
  },

  _validAddons: function(addons) {
    if (!this._cachedValidAddons) {
      this._cachedValidAddons = this._discoverValidAddons(addons);
    }

    return this._cachedValidAddons;
  },

  _discoverValidAddons: function(addons){
    var self = this;
    return addons.reduce(function(validAddons, currentAddon) {
      if (self._isValidDeployPlugin(currentAddon)) {
        var name = self._pluginNameFromAddonName(currentAddon);
        validAddons[name] = currentAddon;
      }

      if (self._isDeployPluginPack(currentAddon)) {
        var nestedAddons = self._discoverValidAddons(currentAddon.addons);
        validAddons = Object.keys(nestedAddons).reduce(function(v, key) {
          v[key] = nestedAddons[key];
          return v;
        }, validAddons);
      }

      return validAddons;
    }, {});
  },

  _buildAliasMap: function(addons, config) {
    var self = this;
    var aliasMap = Object.keys(addons)
      .reduce(function(aliases, name) {
        if (!aliases[name] || !aliases[name].as) {
          aliases[name] = { as: [name] };
        }

        aliases[name].as = self._asArray(aliases[name], 'as');
        return aliases;
      }, config);

    var unknownConfigKeys = _.difference(Object.keys(aliasMap), Object.keys(addons));

    if (unknownConfigKeys.length) {
      this._logUnknownPlugins(unknownConfigKeys, 'config.pipeline.alias');
    }

    return aliasMap;
  },

  _buildDisabledMap: function(aliasMap, config) {
    var aliasArray = Object.keys(aliasMap)
      .reduce(function(aliases, addonName) {
        return aliases.concat(aliasMap[addonName].as);
      }, []);

    var unknownConfigKeys = _.difference(Object.keys(config), aliasArray);

    if (unknownConfigKeys.length) {
      this._logUnknownPlugins(unknownConfigKeys, 'config.pipeline.disabled');
    }

    var disabledMap = aliasArray.reduce(function(map, alias) {
      if (map[alias] === undefined) {
        map[alias] = false;
      }

      return map;
    }, config);

    return disabledMap;
  },

  _buildRunOrderMap: function(config, aliasMap, addons, installedPlugins) {
    var self = this;

    installedPlugins.forEach(function(plugin) {
      if (plugin.runBefore) {
        var befores = self._asArray(plugin, 'runBefore');
        config = self._mergeAuthorProvidedOrderWithConfig('before', plugin.name, befores, config, aliasMap);
      }

      if (plugin.runAfter) {
        var afters = self._asArray(plugin, 'runAfter');
        config = self._mergeAuthorProvidedOrderWithConfig('after', plugin.name, afters, config, aliasMap);
      }
    });

    var aliasArray = Object.keys(aliasMap)
      .reduce(function(aliases, addonName) {
        return aliases.concat(aliasMap[addonName].as);
      }, []);

    var configNames = Object.keys(config).reduce(function(aliasArray, key) {
      if (aliasArray.indexOf(key) === -1) {
        aliasArray.push(key);
      }

      var befores = self._asArray(config[key], 'before');

      befores.forEach(function(name) {
        if (aliasArray.indexOf(name) === -1) {
          aliasArray.push(name);
        }
      });

      var afters = self._asArray(config[key], 'after');

      afters.forEach(function(name) {
        if (aliasArray.indexOf(name) === -1) {
          aliasArray.push(name);
        }
      });

      return aliasArray;
    }, []);

    var unknownConfigKeys = _.difference(configNames, aliasArray);

    if (unknownConfigKeys.length) {
      this._logUnknownPlugins(unknownConfigKeys, 'config.pipeline.runOrder');
    }

    return config;
  },

  _installedPlugins: function(addons, aliasMap) {
    return Object.keys(addons)
      .map(function(addonName) {
        var addon   = addons[addonName];
        var aliases = aliasMap[addonName].as;

        return aliases.map(function(alias) {
          var v = addon.createDeployPlugin({ name: alias });
          return v;
        });
      })
      .reduce(function(plugins, arr) {
        return plugins.concat(arr);
      }, []);
  },

  _applyDisabledConfig: function(plugins, disabledMap) {
    return plugins.filter(function(plugin) {
      return !disabledMap[plugin.name];
    }) ;
  },

  _applyRunOrderConfig: function(plugins, runOrderMap) {
    var self          = this;
    var graph         = new DAG();
    var sortedPlugins = [];

    try {
      plugins.forEach(function(plugin) {
        var before = self._asArray(runOrderMap[plugin.name], 'before');
        var after = self._asArray(runOrderMap[plugin.name], 'after');
        graph.addEdges(plugin.name, plugin, before, after);
      });

      graph.topsort(function (vertex) {
        sortedPlugins.push(vertex.value);
      });
    } catch(err) {
      if (/cycle detected/.test(err)) {
        throw new SilentError('your ember-cli-deploy plugins have a circular dependency:' + err.message);
      } else {
        throw err;
      }
    }

    return sortedPlugins;
  },

  _isDeployPluginPack: function(addon) {
    return this._addonHasKeyword(addon, 'ember-cli-deploy-plugin-pack');
  },

  _isValidDeployPlugin: function(addon) {
    return this._addonHasKeyword(addon, 'ember-cli-deploy-plugin') && this._addonImplementsDeploymentHooks(addon);
  },

  _pluginNameFromAddonName: function(addon) {
    var pluginNameRegex = /^(ember\-cli\-deploy\-)(.*)$/;
    return addon.name.match(pluginNameRegex)[2];
  },

  _addonHasKeyword: function(addon, keyword) {
    var keywords = addon.pkg.keywords;
    return keywords.indexOf(keyword) > -1;
  },

  _addonImplementsDeploymentHooks: function(addon) {
    return addon.createDeployPlugin && typeof addon.createDeployPlugin === 'function';
  },

  _asArray: function(obj, key) {
    if (!obj || !obj[key]) {
      return [];
    }
    if (typeof obj[key] === 'string') {
      return [obj[key]];
    }
    return obj[key].slice();
  },

  _mergeAuthorProvidedOrderWithConfig: function(type, pluginName, names, config, aliasMap) {
    var self = this;
    names.forEach(function(name) {
      var aliases = aliasMap[name] && aliasMap[name].as;
      if (aliases) {
        if (!config[pluginName]) {
          config[pluginName] = {};
        }

        if (!config[pluginName][type]) {
          config[pluginName][type] = aliases;
        } else {
          var combined = self._asArray(config[pluginName], type)
            .reduce(function(all, current) {
              if (all.indexOf(current) === -1) {
                all.push(current);
              }

              return all;
            }, aliases);
          config[pluginName][type] = combined;
        }
      }
    });

    return config;
  },

  _logUnknownPlugins: function(names, configKey) {
    var message = chalk.yellow('Your config has referenced the following unknown plugins or aliases in `' + configKey + '`:\n');
    this._ui.writeLine(message, 'WARNING');
    names.forEach(function(name) {
      message = chalk.yellow('- ' + name + '\n');
      this._ui.writeLine(message, 'WARNING');
    }.bind(this));
  },
});
