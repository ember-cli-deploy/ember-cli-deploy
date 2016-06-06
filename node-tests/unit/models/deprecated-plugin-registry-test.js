var expect         = require('../../helpers/expect');
var DeprecatedPluginRegistry = require('../../../lib/models/deprecated-plugin-registry');

var logOutput, mockUi;

describe('Deprecated Plugin Registry', function() {
  beforeEach(function() {
    logOutput = [];
    mockUi = {
      writeLine: function(s) {
        var sanitized = s.replace('\u001b[33m', '')
          .replace('\u001b[39m', '')
          .replace(/\n/g, '');
        logOutput.push(sanitized);
      },
      writeError: function(s) {
        var sanitized = s.replace('\u001b[33m', '')
          .replace('\u001b[39m', '')
          .replace(/\n/g, '');
        logOutput.push(sanitized);
      }
    };
  });

  afterEach(function() {
    logOutput = null;
    mockUi = null;
  });

  it('warns the user that config.plugins has been deprecated', function() {
    var project = makeProject(['foo']);
    var config  = {
      plugins: ['foo', 'foo:bar'],
    };

    new DeprecatedPluginRegistry(project, mockUi, config);

    expect(logOutput.length).to.eq(3);
    expect(logOutput[0]).to.eq('Use of the `config.plugins` property has been deprecated. Please use the new plugin run controls.');
    expect(logOutput[1]).to.eq('See the following page for information:');
    expect(logOutput[2]).to.eq('http://ember-cli-deploy.com/docs/v1.0.x-beta.1/configuration/');
  });

  it('throws an error if using old and new plugin controls simultaneously', function() {
    var project = makeProject(['foo']);
    var config  = {
      plugins: ['foo', 'foo:bar'],
      pipeline: {
        alias: {
          foo: { as: ['foo', 'foo:bar'] }
        },
      },
    };

    expect(function() {
      new DeprecatedPluginRegistry(project, mockUi, config);
    }).to.throw('Use of the old and new plugin controls simultaneously does not make sense.\nPlease use the new plugin controls\nSee the following page for information:\n\nhttp://ember-cli-deploy.com/docs/v1.0.x-beta.1/configuration/\n');
  });

  it('returns the list of deploy plugins', function() {
    var project = makeProject(['a', 'b', 'c', 'd']);

    var registry = new DeprecatedPluginRegistry(project, mockUi, {
      plugins: ['a', 'c', 'c:2', 'd:e'],
    });

    var plugins = registry.pluginInstances();

    expect(plugins.map(function(plugin) { return plugin.name; })).to.deep.equal(['a', 'c', '2', 'e']);
  });
});

function makeProject(addonNames) {
  return {
    name: function() {return 'test-project';},
    root: process.cwd(),
    addons: addonNames.map(function(name){
      return makePlugin(name);
    })
  };
}

function makePlugin(name, props) {
  return {
    name: 'ember-cli-deploy-' + name,
    pkg: {
      keywords: [
        'ember-cli-deploy-plugin'
      ]
    },
    createDeployPlugin: function(options) {
      var plugin = Object.create({
        name: options.name,
        willDeploy: function() {},
        upload: function() {}
      });
      if (props) {
        Object.keys(props).forEach(function(key) { plugin[key] = props[key]; });
      }
      return plugin;
    }
  };
}
