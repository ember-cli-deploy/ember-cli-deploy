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

  describe('creating a new instance', function() {
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
  });

  describe('setting up a new instance', function() {
    describe('registering addons with the pipeline', function() {
      it('registers addons with ember-cli-deploy-plugin keyword', function() {
        var task = new PipelineTask({
          project: mockProject,
          ui: mockUi,
          deployTarget: 'development',
          config: mockConfig,
          hooks: ['willDeploy', 'upload']
        });

        task._pluginInstances = function() {
          return [{
            name: 'test-plugin',
            willDeploy: function() {},
            upload: function() {},
          }];
        };

        task.setup();
        var registeredHooks = task._pipeline._pipelineHooks;

        expect(registeredHooks.willDeploy[0].name).to.eq('test-plugin');
        expect(registeredHooks.willDeploy[0].fn).to.be.a('function');
        expect(registeredHooks.upload[0].name).to.eq('test-plugin');
        expect(registeredHooks.upload[0].fn).to.be.a('function');
      });

      describe('requiredHooks', function() {
        it('validates that required hooks are implemented', function () {
          var task = new PipelineTask({
            project: mockProject,
            ui: mockUi,
            deployTarget: 'development',
            config: mockConfig,
            hooks: ['willDeploy', 'upload'],
            requiredHooks: ['willDeploy'],
            _pluginInstances: function() {
              return [{
                name: 'test-plugin',
                upload: function() {},
                willDeploy: function() {},
              }];
            }
          });

          var fn = function() {
            task.setup();
          };

          expect(fn).to.not.throw(/not implemented by any registered plugin/);
        });

        it('throws if required hooks are not implemented', function () {
          var task = new PipelineTask({
            project: mockProject,
            ui: mockUi,
            deployTarget: 'development',
            config: mockConfig,
            hooks: ['willDeploy', 'upload', 'fetchRevisions'],
            requiredHooks: ['fetchRevisions']
          });

          task._pluginInstances = function() {
            return [{
              name: 'test-plugin',
              upload: function() {},
              willDeploy: function() {},
            }];
          };

          var fn = function() {
            task.setup();
          };

          expect(fn).to.throw('fetchRevisions not implemented by any registered plugin');
        });
      });
    });
  });

  describe('executing the pipeline task', function() {
    it('executes the pipeline, passing in the deployment context', function() {
      var pipelineExecuted = false;
      var pipelineContext;

      var task = new PipelineTask({
        project: mockProject,
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
        },
        _pluginInstances: function() {
          return [];
        },
      });

      return expect(task.run()).to.be.fulfilled
        .then(function() {
          expect(pipelineExecuted).to.be.true;
          expect(pipelineContext.ui).to.eq(mockUi);
          expect(pipelineContext.project).to.eq(mockProject);
          expect(pipelineContext.deployTarget).to.eq('development');
          expect(pipelineContext.config.build.environment).to.eq('development');
          expect(pipelineContext.commandOptions.revision).to.eq('123abc');
        });
    });

    it('executes the pipeline, logging at a verbose level', function() {
      var logOutput = '';
      mockUi = {
        verbose: true,
        write: function(s) {
          logOutput = logOutput + s;
        },
        writeError: function(s) {
          logOutput = logOutput + s + '\n';
        }
      };

      var task = new PipelineTask({
        project: mockProject,
        ui: mockUi,
        deployTarget: 'development',
        config: mockConfig,
        commandOptions: {revision: '123abc'},
        hooks: ['willDeploy', 'upload'],
        pipeline: new Pipeline(['willDeploy', 'upload'], {
          ui: mockUi
        }),
        _pluginInstances: function() {
          return [{
            name: 'test-plugin',
            willDeploy: function() {
            },
            upload: function() {}
          }];
        },
      });

      task.setup();

      return expect(task.run()).to.be.fulfilled.then(function() {
        var logLines = logOutput.split('\n');
        expect(logLines[ 0]).to.eq('\u001b[34mRegistering hook -> willDeploy[test-plugin]');
        expect(logLines[ 1]).to.eq('\u001b[39m\u001b[34mRegistering hook -> upload[test-plugin]');
        expect(logLines[ 2]).to.eq('\u001b[39m\u001b[34mRegistering hook -> willDeploy[test-plugin]');
        expect(logLines[ 3]).to.eq('\u001b[39m\u001b[34mRegistering hook -> upload[test-plugin]');
        expect(logLines[ 4]).to.eq('\u001b[39m\u001b[34mExecuting pipeline');
        expect(logLines[ 5]).to.eq('\u001b[39m\u001b[34m|');
        expect(logLines[ 6]).to.eq('\u001b[39m\u001b[34m+- willDeploy');
        expect(logLines[ 7]).to.eq('\u001b[39m\u001b[34m|  |');
        expect(logLines[ 8]).to.eq('\u001b[39m\u001b[34m|  +- test-plugin');
        expect(logLines[ 9]).to.eq('\u001b[39m\u001b[34m|  |');
        expect(logLines[10]).to.eq('\u001b[39m\u001b[34m|  +- test-plugin');
        expect(logLines[11]).to.eq('\u001b[39m\u001b[34m|');
        expect(logLines[12]).to.eq('\u001b[39m\u001b[34m+- upload');
        expect(logLines[13]).to.eq('\u001b[39m\u001b[34m|  |');
        expect(logLines[14]).to.eq('\u001b[39m\u001b[34m|  +- test-plugin');
        expect(logLines[15]).to.eq('\u001b[39m\u001b[34m|  |');
        expect(logLines[16]).to.eq('\u001b[39m\u001b[34m|  +- test-plugin');
        expect(logLines[17]).to.eq('\u001b[39m\u001b[34m|');
        expect(logLines[18]).to.eq('\u001b[39m\u001b[34mPipeline complete');
      });
    });
  });
});
