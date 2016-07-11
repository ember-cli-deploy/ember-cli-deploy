var expect         = require('../../helpers/expect');
var PluginRegistry = require('../../../lib/models/plugin-registry');

var logOutput, mockUi;

describe('Plugin Registry', function() {
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

  describe('initialization', function() {
    it('initializes the pipeline correctly', function() {
      var project = makeProject(['foo']);
      var config  = {
        pipeline: {
          alias: {},
          runOrder: {},
          disabled: {},
        },
      };

      var registry = new PluginRegistry(project, mockUi, config);

      expect(registry._project).to.deep.equal(project);
      expect(registry._ui).to.deep.equal(mockUi);
      expect(registry._aliasConfig).to.equal(config.pipeline.alias);
      expect(registry._runOrderConfig).to.equal(config.pipeline.runOrder);
      expect(registry._disabledConfig).to.equal(config.pipeline.disabled);
    });

    it('initializes the pipeline correctly when pipeline is undefined', function() {
      var project = makeProject(['foo']);
      var config  = { };

      var registry = new PluginRegistry(project, mockUi, config);

      expect(registry._project).to.deep.equal(project);
      expect(registry._ui).to.deep.equal(mockUi);
      expect(registry._aliasConfig).to.deep.equal({});
      expect(registry._runOrderConfig).to.deep.equal({});
      expect(registry._disabledConfig).to.deep.equal({});
    });

    it('initializes the pipeline correctly when pipeline is defined but plugin controls are not', function() {
      var project = makeProject(['foo']);
      var config  = {
        pipeline: {},
      };

      var registry = new PluginRegistry(project, mockUi, config);

      expect(registry._project).to.deep.equal(project);
      expect(registry._ui).to.deep.equal(mockUi);
      expect(registry._aliasConfig).to.deep.equal({});
      expect(registry._runOrderConfig).to.deep.equal({});
      expect(registry._disabledConfig).to.deep.equal({});
    });
  });

  it('warns if no plugins are installed', function() {
    var project = makeProject([]);

    var registry = new PluginRegistry(project, mockUi, {});

    registry.pluginInstances();

    expect(logOutput.length).to.eq(4);
    expect(logOutput[0]).to.eq('WARNING: No plugins installed/enabled');
    expect(logOutput[1]).to.eq('ember-cli-deploy works by registering plugins in it\'s pipeline.');
    expect(logOutput[2]).to.eq('In order to execute a deployment you must install at least one ember-cli-deploy compatible plugin.');
    expect(logOutput[3]).to.eq('Visit http://ember-cli-deploy.com/plugins/ for a list of supported plugins.');
  });

  it('returns plugins for addons that have the correct keyword and implement the plugin function', function() {
    var validPlugin                = makePlugin('foo');
    var addonMissingKeyword        = makeAddon('bar');
    var addonMissingPluginFunction = makePlugin('bar');
    delete addonMissingPluginFunction.createDeployPlugin;

    var project = {
      name: function() {return 'test-project';},
      root: process.cwd(),
      addons: [validPlugin, addonMissingKeyword, addonMissingPluginFunction],
    };

    var registry = new PluginRegistry(project, mockUi, {});

    var plugins = registry.pluginInstances();

    expect(plugins.length).to.equal(1);
    expect(plugins[0].name).to.equal('foo');
    expect(typeof plugins[0].willDeploy).to.equal('function');
    expect(typeof plugins[0].upload).to.equal('function');
  });

  it('returns plugins from plugin packs', function() {
    var validPlugin     = makePlugin('foo');
    var validPluginPack = makePluginPack('bar', [validPlugin]);

    var project = {
      name: function() {return 'test-project';},
      root: process.cwd(),
      addons: [validPluginPack],
    };

    var registry = new PluginRegistry(project, mockUi, {});

    var plugins = registry.pluginInstances();

    expect(plugins.length).to.equal(1);
    expect(plugins[0].name).to.equal('foo');
  });

  it('includes plugin packs that are also plugins', function() {
    var validPlugin     = makePlugin('foo');
    var validPluginPack = makePluginPack('bar', [validPlugin]);
    validPluginPack.pkg.keywords.push('ember-cli-deploy-plugin');
    validPluginPack.createDeployPlugin = function(options) { return { name: options.name }; };

    var project = {
      name: function() {return 'test-project';},
      root: process.cwd(),
      addons: [validPluginPack],
    };

    var registry = new PluginRegistry(project, mockUi, {});

    var plugins = registry.pluginInstances();

    expect(plugins.length).to.equal(2);
    expect(plugins[0].name).to.equal('bar');
    expect(plugins[1].name).to.equal('foo');
  });

  describe('aliasing plugins', function() {
    it('returns plugin instances for aliases defined in config', function() {
      var project = makeProject(['foo', 'bar', 'baz']);

      var registry = new PluginRegistry(project, mockUi, {
        pipeline: {
          alias: {
            foo: { as: 'xxx' },
            bar: { as: ['bar', 'bbb'] },
          },
        },
      });

      var plugins = registry.pluginInstances();

      expect(plugins.length).to.equal(4);
      expect(plugins[0].name).to.equal('xxx');
      expect(plugins[1].name).to.equal('bar');
      expect(plugins[2].name).to.equal('bbb');
      expect(plugins[3].name).to.equal('baz');
    });

    it('warns if alias config references an addon that is not installed', function() {
      var project = makeProject(['foo']);

      var registry = new PluginRegistry(project, mockUi, {
        pipeline: {
          alias: {
            bar: { as: ['baz'] },
          },
        },
      });

      registry.pluginInstances();

      expect(logOutput.length).to.eq(2);
      expect(logOutput[0]).to.eq('Your config has referenced the following unknown plugins or aliases in `config.pipeline.alias`:');
      expect(logOutput[1]).to.eq('- bar');
    });
  });

  describe('disabling plugins', function() {
    it('returns only plugins that are not marked as disabled', function() {
      var project = makeProject(['foo', 'bar', 'baz']);

      var registry = new PluginRegistry(project, mockUi, {
        pipeline: {
          alias: {
            baz: { as: ['aaa', 'bbb'] },
          },
          disabled: {
            foo: true,
            bar: false,
            bbb: true,
          },
        },
      });

      var plugins = registry.pluginInstances();

      expect(plugins.length).to.equal(2);
      expect(plugins[0].name).to.equal('bar');
      expect(plugins[1].name).to.equal('aaa');
      expect(logOutput.length).to.eq(0);

      registry = new PluginRegistry(project, mockUi, {
        pipeline: {
          alias: {
            baz: { as: ['aaa', 'bbb'] },
          },
          disabled: {
            allExcept: 'aaa',
          },
        },
      });

      plugins = registry.pluginInstances();

      expect(plugins.length).to.equal(1);
      expect(plugins[0].name).to.equal('aaa');
      expect(logOutput.length).to.eq(0);


      registry = new PluginRegistry(project, mockUi, {
        pipeline: {
          alias: {
            baz: { as: ['aaa', 'bbb'] },
          },
          disabled: {
            allExcept: 'aaa',
            foo: false,
          },
        },
      });

      plugins = registry.pluginInstances();

      expect(plugins.length).to.equal(2);
      expect(plugins[0].name).to.equal('foo');
      expect(plugins[1].name).to.equal('aaa');
      expect(logOutput.length).to.eq(0);
    });

    it('warns if disabled config references an addon that is not installed', function() {
      var project = makeProject(['foo']);

      var registry = new PluginRegistry(project, mockUi, {
        pipeline: {
          disabled: {
            allExcept: ['xxx', 'bbb'],
            bar: true,
            foo: false,
          },
        },
      });

      registry.pluginInstances();

      expect(logOutput.length).to.eq(4);
      expect(logOutput[0]).to.eq('Your config has referenced the following unknown plugins or aliases in `config.pipeline.disabled`:');
      expect(logOutput[1]).to.eq('- bar');
      expect(logOutput[2]).to.eq('- xxx');
      expect(logOutput[3]).to.eq('- bbb');
    });
  });

  describe('specifying plugin run order', function() {
    it('warns if runOrder config references an addon that is not installed', function() {
      var project = makeProject(['foo']);

      var registry = new PluginRegistry(project, mockUi, {
        pipeline: {
          runOrder: {
            baz: { before: ['foo'] },
            foo: { after: 'xxx' },
          },
        },
      });

      registry.pluginInstances();

      expect(logOutput.length).to.eq(3);
      expect(logOutput[0]).to.eq('Your config has referenced the following unknown plugins or aliases in `config.pipeline.runOrder`:');
      expect(logOutput[1]).to.eq('- baz');
      expect(logOutput[2]).to.eq('- xxx');
    });

    it('returns plugins ordered by config specified run before', function() {
      var project = makeProject(['foo', 'bar']);

      testOrder(project, {
        pipeline: {
          runOrder: {
            bar: { before: 'foo' },
          },
        },
      }, ['bar', 'foo']);

      testOrder(project, {
        pipeline: {
          runOrder: {
            foo: { before: 'bar' },
          },
        },
      }, ['foo', 'bar']);

      testOrder(project, {
        pipeline: {
          alias: {
            bar: { as: ['bar', 'baz'] },
          },
          runOrder: {
            bar: { before: 'foo' },
            baz: { before: 'bar' },
          },
        },
      }, ['baz', 'bar', 'foo']);
    });

    it('returns plugins ordered by config specified run after', function() {
      var project = makeProject(['foo', 'bar']);

      testOrder(project, {
        pipeline: {
          runOrder: {
            bar: { after: 'foo' },
          },
        },
      }, ['foo', 'bar']);

      testOrder(project, {
        pipeline: {
          runOrder: {
            foo: { after: 'bar' },
          },
        },
      }, ['bar', 'foo']);

      testOrder(project, {
        pipeline: {
          alias: {
            bar: { as: ['bar', 'baz'] },
          },
          runOrder: {
            bar: { after: 'foo' },
            baz: { after: 'bar' },
          },
        },
      }, ['foo', 'bar', 'baz']);
    });

    it('returns plugins ordered by multiple config specified run order constraints', function() {
      var project = makeProject(['foo', 'bar', 'baz']);

      testOrder(project, {
        pipeline: {
          runOrder: {
            foo: { after: ['bar', 'baz'] },
            baz: { after: ['bar'] },
          },
        },
      }, ['bar', 'baz', 'foo']);

      testOrder(project, {
        pipeline: {
          runOrder: {
            bar: { after: ['foo', 'baz'] },
            baz: { after: ['foo'] },
          },
        },
      }, ['foo', 'baz', 'bar']);
    });

    it('returns plugins ordered by author specified run order', function() {
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          makePlugin('foo', {}),
          makePlugin('bar', { runAfter: ['foo'] }),
          makePlugin('baz', { runBefore: ['foo'] })
        ]
      };

      testOrder(project, {}, ['baz', 'foo', 'bar']);
    });

    it('returns plugins ordered by merged config and author provided run order', function() {
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          makePlugin('foo', {}),
          makePlugin('bar', { runAfter: ['foo'] }),
          makePlugin('baz', { })
        ]
      };

      testOrder(project, {
        pipeline: {
          runOrder: {
            baz: { before: ['foo'] },
          },
        },
      }, ['baz', 'foo', 'bar']);

      testOrder(project, {
        pipeline: {
          runOrder: {
            baz: { after: ['foo', 'bar'] },
          },
        },
      }, ['foo', 'bar', 'baz']);

      project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          makePlugin('foo', {}),
          makePlugin('bar', { runBefore: ['foo'] }),
          makePlugin('baz', { })
        ]
      };

      testOrder(project, {
        pipeline: {
          runOrder: {
            baz: { before: ['foo', 'bar'] },
          },
        },
      }, ['baz', 'bar', 'foo']);

      testOrder(project, {
        pipeline: {
          runOrder: {
            baz: { after: ['foo'] },
          },
        },
      }, ['bar', 'foo', 'baz']);

      project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          makePlugin('foo', { runAfter: ['bar'] }),
          makePlugin('bar', {}),
          makePlugin('baz', {})
        ]
      };

      testOrder(project, {
        pipeline: {
          runOrder: {
            foo: { after: 'baz' },
          },
        },
      }, ['bar', 'baz', 'foo']);
    });

    it('respects aliases when ordering plugins by author provided run order', function() {
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          makePlugin('foo', { runAfter: ['bar'] }),
          makePlugin('bar', {}),
          makePlugin('baz', {}),
          makePlugin('bop', {}),
        ]
      };

      testOrder(project, {
        pipeline: {
          alias: {
            bar: { as: ['boo', 'bee'] },
          },
        },
      }, ['boo', 'bee', 'foo', 'baz', 'bop']);

      testOrder(project, {
        pipeline: {
          alias: {
            bar: { as: ['bar', 'boo'] },
          },
        },
      }, ['bar', 'boo', 'foo', 'baz', 'bop']);

      testOrder(project, {
        pipeline: {
          alias: {
            bar: { as: ['bar', 'boo'] },
          },
          runOrder: {
            foo: { after: 'bop', before: 'baz' },
          },
        },
      }, ['bar', 'boo', 'bop', 'foo', 'baz']);

      project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          makePlugin('foo', {}),
          makePlugin('bar', {}),
          makePlugin('baz', { runBefore: ['foo'] }),
          makePlugin('bop', {}),
        ]
      };

      testOrder(project, {
        pipeline: {
          alias: {
            foo: { as: ['boo', 'bee'] },
          },
        },
      }, ['baz', 'boo', 'bee', 'bar', 'bop']);

      testOrder(project, {
        pipeline: {
          alias: {
            foo: { as: ['foo', 'boo'] },
          },
        },
      }, ['baz', 'foo', 'boo', 'bar', 'bop']);

      testOrder(project, {
        pipeline: {
          alias: {
            foo: { as: ['foo', 'boo'] },
          },
          runOrder: {
            baz: { after: 'bop', before: 'bar' },
          },
        },
      }, ['bop', 'baz', 'foo', 'boo', 'bar']);
    });

    it('detects circular dependencies', function() {
      var project = makeProject(['foo', 'bar', 'baz']);

      expect(function() {
        testOrder(project, {
          pipeline: {
            runOrder: {
              foo: { after: ['bar'] },
              bar: { after: ['baz'] },
              baz: { after: ['foo'] },
            },
          },
        });
      }).to.throw(/your ember-cli-deploy plugins have a circular dependency.*baz.*foo.*bar.*baz/);

      project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          makePlugin('foo', { runAfter: ['bar'] }),
          makePlugin('bar', {}),
          makePlugin('baz', {})
        ]
      };

      expect(function() {
        testOrder(project, {
          pipeline: {
            runOrder: {
              foo: { before: 'bar' },
            },
          },
        });
      }).to.throw(/your ember-cli-deploy plugins have a circular dependency:cycle detected: foo <- bar <- foo/);
    });
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

function makeAddon(name) {
  return {
    name: 'ember-cli-deploy-' + name,
    pkg: { keywords: [ ] },
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

function makePluginPack(name, plugins) {
  return {
    name: 'ember-cli-deploy-' + name,
    pkg: {
      keywords: [
        'ember-cli-deploy-plugin-pack'
      ]
    },
    addons: plugins,
  };
}

function testOrder(project, config, expectedNames) {
  var registry = new PluginRegistry(project, mockUi, config);
  var plugins = registry.pluginInstances();
  expect(plugins.map(function(plugin){ return plugin.name; })).to.deep.equal(expectedNames);
}
