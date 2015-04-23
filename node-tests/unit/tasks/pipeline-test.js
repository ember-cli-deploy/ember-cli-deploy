var Promise      = require('ember-cli/lib/ext/promise');
var PipelineTask = require('../../../lib/tasks/pipeline');
var expect       = require('../../helpers/expect');
var assert       = require('chai').assert;

describe('PipelineTask', function() {
  var mockProject   = {addons: []};
  var mockConfig    = {};
  var mockAppConfig = {};
  var mockUi        = { write: function() {} };

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
          config: mockConfig,
          appConfig: mockAppConfig
        });
      };

      expect(fn).to.throw('No ui passed to pipeline task');
    });

    describe('setting environment variables from .env', function() {
      it('sets the process.env vars if a .env file exists for deploy environment', function() {
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: []
        };

        assert.isUndefined(process.env.ENVTEST);

        var task = new PipelineTask({
          project: project,
          ui: mockUi,
          deployEnvironment: 'development',
          deployConfigPath: 'node-tests/fixtures/config/deploy.js',
          hooks: ['willDeploy', 'upload']
        });

        assert.equal(process.env.ENVTEST, 'SUCCESS');
      });
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
          deployEnvironment: 'development',
          deployConfigPath: 'node-tests/fixtures/config/deploy.js',
          hooks: ['willDeploy', 'upload']
        });

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
          deployEnvironment: 'development',
          deployConfigPath: 'node-tests/fixtures/config/deploy.js',
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
          deployEnvironment: 'development',
          deployConfigPath: 'node-tests/fixtures/config/deploy.js',
          hooks: ['willDeploy', 'upload']
        });

        var registeredHooks = task._pipeline._pipelineHooks;

        expect(registeredHooks.willDeploy[0]).to.be.undefined;
      });
    });
  });

  describe('executing the pipeline task', function() {
    it ('executes the pipeline, passing in the deployment context', function() {
      var pipelineExecuted = false;

      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [ ]
      };

      var task = new PipelineTask({
        project: project,
        ui: mockUi,
        deployEnvironment: 'development',
        deployConfigPath: 'node-tests/fixtures/config/deploy.js',
        hooks: ['willDeploy', 'upload'],
        pipeline: {
          execute: function() {
            pipelineExecuted = true;
            return Promise.resolve();
          }
        }
      });

      return expect(task.run()).to.be.fulfilled
        .then(function() {
          expect(pipelineExecuted).to.be.true;
        });
    });
  });
});
