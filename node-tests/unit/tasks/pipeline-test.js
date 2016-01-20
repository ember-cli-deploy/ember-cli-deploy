var Promise      = require('ember-cli/lib/ext/promise');
var PipelineTask = require('../../../lib/tasks/pipeline');
var Pipeline     = require('../../../lib/models/pipeline');
var expect       = require('../../helpers/expect');

describe('PipelineTask', function() {
  var mockProject   = {addons: [], root: process.cwd()};
  var mockConfig    = {};
  var mockUi;
  beforeEach(function(){
    mockUi = { write: function() {},  writeError: function() {} };
  });

  describe('creating and setting up a new instance', function() {
    it ('raises an error if project is not provided', function() {
      var fn = function() {
        new PipelineTask({});
      };

      expect(fn).to.throw('No project passed to pipeline task');
    });

    it ('raises an error if ui is not provided', function() {
      var fn = function() {
        new PipelineTask({
          project: mockProject,
          config: mockConfig
        });
      };

      expect(fn).to.throw('No ui passed to pipeline task');
    });

    it('raises an error if deployTarget is not provided', function() {
      var fn = function() {
        new PipelineTask({
          project: mockProject,
          ui: mockUi,
          config: mockConfig
        });
      };

      expect(fn).to.throw('You need to provide a deployTarget: `ember deploy production`');
    });

    it('raises an error if config is not provided', function() {
      var fn = function() {
        new PipelineTask({
          project: mockProject,
          ui: mockUi,
          deployTarget: 'development'
        });
      };

      expect(fn).to.throw('No config passed to pipeline task');
    });

    describe('registering addons with the pipeline', function() {
      it('registers addons with ember-cli-deploy-plugin keyword', function() {
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: [
            {
              name: 'ember-cli-deploy-test-plugin',
              pkg: {
                keywords: [
                  'ember-cli-deploy-plugin'
                ]
              },
              createDeployPlugin: function() {
                return {
                  name: 'test-plugin',
                  willDeploy: function() {},
                  upload: function() {}
                };
              }
            }
          ]
        };

        var task = new PipelineTask({
          project: project,
          ui: mockUi,
          deployTarget: 'development',
          config: mockConfig,
          hooks: ['willDeploy', 'upload']
        });
        task.setup();
        var registeredHooks = task._pipeline._pipelineHooks;

        expect(registeredHooks.willDeploy[0].name).to.eq('test-plugin');
        expect(registeredHooks.willDeploy[0].fn).to.be.a('function');
        expect(registeredHooks.upload[0].name).to.eq('test-plugin');
        expect(registeredHooks.upload[0].fn).to.be.a('function');
      });

      it('does not register addons missing the ember-cli-deploy-plugin keyword', function() {
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: [
            {
              name: 'ember-cli-deploy-test-plugin',
              pkg: {
                keywords: [
                  'some-other-plugin'
                ]
              },
              createDeployPlugin: function() {
                return {
                  willDeploy: function() {},
                  upload: function() {}
                };
              }
            }
          ]
        };

        var task = new PipelineTask({
          project: project,
          ui: mockUi,
          deployTarget: 'development',
          config: mockConfig,
          hooks: ['willDeploy', 'upload']
        });

        var registeredHooks = task._pipeline._pipelineHooks;

        expect(registeredHooks.willDeploy[0]).to.be.undefined;
      });

      it('does not register addons that don\'t implement the createDeployPlugin function', function() {
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: [
            {
              name: 'ember-cli-deploy-test-plugin',
              pkg: {
                keywords: [ ]
              },
              someOtherFunction: function() {
                return {
                  willDeploy: function() {}
                };
              }
            }
          ]
        };

        var task = new PipelineTask({
          project: project,
          ui: mockUi,
          deployTarget: 'development',
          config: mockConfig,
          hooks: ['willDeploy', 'upload']
        });

        var registeredHooks = task._pipeline._pipelineHooks;

        expect(registeredHooks.willDeploy[0]).to.be.undefined;
      });

      it('registers configured addons only, if addons configuration is present', function () {
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: [
            {
              name: 'ember-cli-deploy-foo-plugin',
              pkg: {
                keywords: [
                  'ember-cli-deploy-plugin'
                ]
              },
              createDeployPlugin: function() {
                return {
                  name: 'foo-plugin',
                  willDeploy: function() {},
                  upload: function() {}
                };
              }
            },
            {
              name: 'ember-cli-deploy-bar-plugin',
              pkg: {
                keywords: [
                  'ember-cli-deploy-plugin'
                ]
              },
              createDeployPlugin: function() {
                return {
                  name: 'bar-plugin',
                  willDeploy: function() {},
                  upload: function() {}
                };
              }
            }
          ]
        };

        var task = new PipelineTask({
          project: project,
          ui: mockUi,
          deployTarget: 'development',
          config: { plugins: ['foo-plugin'] },
          hooks: ['willDeploy', 'upload']
        });
        task.setup();
        var registeredHooks = task._pipeline._pipelineHooks;

        expect(registeredHooks.willDeploy.length).to.equal(1);
        expect(registeredHooks.willDeploy[0].name).to.eq('foo-plugin');
        expect(registeredHooks.willDeploy[0].fn).to.be.a('function');
        expect(registeredHooks.upload.length).to.equal(1);
        expect(registeredHooks.upload[0].name).to.eq('foo-plugin');
        expect(registeredHooks.upload[0].fn).to.be.a('function');
      });
      it('registers dependent plugin addons of a plugin pack addon designated by the ember-cli-deploy-plugin-pack keyword', function() {
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: [
            {
              name: 'ember-cli-deploy-test-plugin-pack',
              pkg: {
                keywords: [
                  'ember-cli-deploy-plugin-pack'
                ]
              },
              addons: [
                {
                  name: 'ember-cli-deploy-test-plugin',
                  pkg: {
                    keywords: [
                      'ember-cli-deploy-plugin'
                    ]
                  },
                  createDeployPlugin: function() {
                    return {
                      name: 'test-plugin',
                      willDeploy: function() {},
                      upload: function() {}
                    };
                  }
                }
              ]
            }
          ]
        };

        var task = new PipelineTask({
          project: project,
          ui: mockUi,
          deployTarget: 'development',
          config: mockConfig,
          hooks: ['willDeploy', 'upload']
        });
        task.setup();
        var registeredHooks = task._pipeline._pipelineHooks;

        expect(registeredHooks.willDeploy.length).to.eq(1);
        expect(registeredHooks.willDeploy[0].name).to.eq('test-plugin');
        expect(registeredHooks.willDeploy[0].fn).to.be.a('function');
        expect(registeredHooks.upload.length).to.eq(1);
        expect(registeredHooks.upload[0].name).to.eq('test-plugin');
        expect(registeredHooks.upload[0].fn).to.be.a('function');
      });
    });
  });

  describe('executing the pipeline task', function() {
    it ('executes the pipeline, passing in the deployment context', function() {
      var pipelineExecuted = false;
      var pipelineContext;

      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [ ]
      };

      var task = new PipelineTask({
        project: project,
        ui: mockUi,
        deployTarget: 'development',
        config: { build: { environment: 'development' }},
        commandOptions: {revision: '123abc'},
        hooks: ['willDeploy', 'upload'],
        pipeline: {
          execute: function(context) {
            pipelineExecuted = true;
            pipelineContext = context;
            return Promise.resolve();
          }
        }
      });

      return expect(task.run()).to.be.fulfilled
        .then(function() {
          expect(pipelineExecuted).to.be.true;
          expect(pipelineContext.ui).to.eq(mockUi);
          expect(pipelineContext.project).to.eq(project);
          expect(pipelineContext.deployTarget).to.eq('development');
          expect(pipelineContext.config.build.environment).to.eq('development');
          expect(pipelineContext.commandOptions.revision).to.eq('123abc');
        });
    });

    it('executes the pipeline, logging at a verbose level', function() {
      var logOutput = "";
      mockUi = {
        verbose: true,
        write: function(s) {
          logOutput = logOutput + s;
        },
        writeError: function(s) {
          logOutput = logOutput + s + "\n";
        }
      };
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          {
            name: 'ember-cli-deploy-test-plugin',
            pkg: {
              keywords: [
                'ember-cli-deploy-plugin'
              ]
            },
            createDeployPlugin: function() {
              return {
                name: 'test-plugin',
                willDeploy: function() {
                },
                upload: function() {}
              };
            }
          }
        ]
      };

      var task = new PipelineTask({
        project: project,
        ui: mockUi,
        deployTarget: 'development',
        config: mockConfig,
        commandOptions: {revision: '123abc'},
        hooks: ['willDeploy', 'upload'],
        pipeline: new Pipeline(['willDeploy', 'upload'], {
          ui: mockUi
        })
      });

      task.setup();
      return expect(task.run()).to.be.fulfilled.then(function() {
        var logLines = logOutput.split("\n");
        expect(logLines[ 0]).to.eq("\u001b[34mRegistering hook -> willDeploy[test-plugin]");
        expect(logLines[ 1]).to.eq("\u001b[39m\u001b[34mRegistering hook -> upload[test-plugin]");
        expect(logLines[ 2]).to.eq("\u001b[39m\u001b[34mRegistering hook -> willDeploy[test-plugin]");
        expect(logLines[ 3]).to.eq("\u001b[39m\u001b[34mRegistering hook -> upload[test-plugin]");
        expect(logLines[ 4]).to.eq("\u001b[39m\u001b[34mExecuting pipeline");
        expect(logLines[ 5]).to.eq("\u001b[39m\u001b[34m|");
        expect(logLines[ 6]).to.eq("\u001b[39m\u001b[34m+- willDeploy");
        expect(logLines[ 7]).to.eq("\u001b[39m\u001b[34m|  |");
        expect(logLines[ 8]).to.eq("\u001b[39m\u001b[34m|  +- test-plugin");
        expect(logLines[ 9]).to.eq("\u001b[39m\u001b[34m|  |");
        expect(logLines[10]).to.eq("\u001b[39m\u001b[34m|  +- test-plugin");
        expect(logLines[11]).to.eq("\u001b[39m\u001b[34m|");
        expect(logLines[12]).to.eq("\u001b[39m\u001b[34m+- upload");
        expect(logLines[13]).to.eq("\u001b[39m\u001b[34m|  |");
        expect(logLines[14]).to.eq("\u001b[39m\u001b[34m|  +- test-plugin");
        expect(logLines[15]).to.eq("\u001b[39m\u001b[34m|  |");
        expect(logLines[16]).to.eq("\u001b[39m\u001b[34m|  +- test-plugin");
        expect(logLines[17]).to.eq("\u001b[39m\u001b[34m|");
        expect(logLines[18]).to.eq("\u001b[39m\u001b[34mPipeline complete");
      });
    });
  });

  describe('plugin aliases are correctly handled', function() {
    it('passes correct name to single plugin alias', function () {
      var correctAliasUsed = false;
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          {
            name: 'ember-cli-deploy-foo-plugin',
            pkg: {
              keywords: [
                'ember-cli-deploy-plugin'
              ]
            },
            createDeployPlugin: function(options) {
              correctAliasUsed = (options.name === 'bar-alias');
            }
          }
        ]
      };

      var task = new PipelineTask({
        project: project,
        ui: mockUi,
        deployTarget: 'staging',
        config: { plugins: ['foo-plugin:bar-alias'] },
        pipeline: {
          hookNames: function () {
            return [];
          }
        }
      });

      task.setup();
      expect(correctAliasUsed).to.be.true;
    });

    it('passes correct name to multiple instances of the same plugin', function () {
      var correctAliasUsed = {
        'foo-plugin': false, // plugin without alias
        'bar-alias': false, // first alias
        'doo-alias': false // second alias
      };

      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [
          {
            name: 'ember-cli-deploy-foo-plugin',
            pkg: {
              keywords: [
                'ember-cli-deploy-plugin'
              ]
            },
            createDeployPlugin: function(options) {
              correctAliasUsed[options.name] = true;
            }
          }
        ]
      };

      var task = new PipelineTask({
        project: project,
        ui: mockUi,
        deployTarget: 'staging',
        config: { plugins: ['foo-plugin', 'foo-plugin:bar-alias', 'foo-plugin:doo-alias'] },
        pipeline: {
          hookNames: function () {
            return [];
          }
        }
      });

      task.setup();
      expect(correctAliasUsed['foo-plugin']).to.be.true;
      expect(correctAliasUsed['bar-alias']).to.be.true;
      expect(correctAliasUsed['doo-alias']).to.be.true;
    });

    it('throws error on non-existent plugin in whitelist and appends them to err.unavailablePlugins', function () {
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd()
      };

      var task = new PipelineTask({
        project: project,
        ui: mockUi,
        deployTarget: 'production',
        config: { plugins: ['foo-plugin', 'foo-plugin:bar-alias', 'foo-plugin:doo-alias'] },
        deployConfigPath: 'node-tests/fixtures/config/deploy-for-addons-config-test-with-aliases.js',
      });

      try {
        task.setup();
        expect(false).to.be.true;
      } catch(err) {
        expect(Object.keys(err.unavailablePlugins).length).to.equal(3);
      }
    });
  });
});
