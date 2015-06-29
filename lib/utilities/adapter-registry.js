/* jshint node: true */
var CoreObject     = require('core-object');
var UnknownAdapter = require('./assets/unknown');
var ShaAdapter     = require('./tagging/sha');
var merge          = require('lodash-node/modern/objects/merge');
var Addon = require('ember-cli/lib/models/addon');
var path = require('path');

module.exports = CoreObject.extend({
  init: function() {
    if (!this.project) { return; }

    this.project.addons.forEach(this._mergeDeployAdapters.bind(this));
    this._addAdaptersForTesting();
  },

  lookup: function(type, adapterName) {
    var Adapter = this.adapters[type][adapterName];

    if (!Adapter) {
      return UnknownAdapter;
    } else {
      return Adapter;
    }
  },

  adapters: {
    index: {
    },

    assets: {
    },

    tagging: {
      "sha": ShaAdapter
    }
  },

  _mergeDeployAdapters: function(addon) {
    if (addon.type === 'ember-deploy-addon') {
      this.adapters = merge(this.adapters, addon.adapters);
    }
  },

  _addAdaptersForTesting: function () {
    var adaptersToLoadForTest = process.env['LOAD_ADAPTERS'];
    if (!adaptersToLoadForTest) { return; }

    this.adapters['assets']['null-adapter'] = CoreObject.extend({ upload: function () {} });

    adaptersToLoadForTest.split(',').forEach(function (adapterName) {
      var root = this.project.root;
      var addonPath = path.join(root, 'node_modules/' + adapterName);
      var AddonConstructor = Addon.lookup({
        path: addonPath,
        pkg: require(path.join(addonPath, 'package.json'))
      });

      var addon = this._createAndVerifyAddonForTesting(AddonConstructor);
      this._mergeDeployAdapters(addon);
    }.bind(this));
  },

  _createAndVerifyAddonForTesting: function (AddonConstructor) {
    var addon = new AddonConstructor(this.project);
    if (addon.type !== 'ember-deploy-addon') {
      throw new Error('package of type ' + addon.type + ' must be `ember-cli-deploy`');
    }
    var pkgKeywords = addon.pkg.keywords || [];
    if (pkgKeywords.indexOf('ember-addon') === -1) {
      throw new Error("addon must include `ember-addon` in it's keywords");
    }
    return addon;
  }
});
