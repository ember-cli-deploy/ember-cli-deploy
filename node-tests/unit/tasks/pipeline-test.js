var Promise      = require('ember-cli/lib/ext/promise');
var PipelineTask = require('../../../lib/tasks/pipeline');
var expect       = require('../../helpers/expect');
var assert       = require('chai').assert;

describe('PipelineTask', function() {
  var mockProject   = {addons: []};
  var mockConfig    = {};
  var mockAppConfig = {};
  var mockUi        = { write: function() {} };

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
        return task.setup().then(function(){
          var registeredHooks = task._pipeline._pipelineHooks;

          expect(registeredHooks.willDeploy[0].name).to.eq('test-plugin');
          expect(registeredHooks.willDeploy[0].fn).to.be.a('function');
          expect(registeredHooks.upload[0].name).to.eq('test-plugin');
          expect(registeredHooks.upload[0].fn).to.be.a('function');
        });
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
          deployEnvironment: 'development',
          deployConfigPath: 'node-tests/fixtures/config/deploy-for-addons-config-test.js',
          hooks: ['willDeploy', 'upload']
        });
        return task.setup().then(function(){
          var registeredHooks = task._pipeline._pipelineHooks;

          expect(registeredHooks.willDeploy.length).to.equal(1);
          expect(registeredHooks.willDeploy[0].name).to.eq('foo-plugin');
          expect(registeredHooks.willDeploy[0].fn).to.be.a('function');
          expect(registeredHooks.upload.length).to.equal(1);
          expect(registeredHooks.upload[0].name).to.eq('foo-plugin');
          expect(registeredHooks.upload[0].fn).to.be.a('function');
        });
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
          deployEnvironment: 'development',
          deployConfigPath: 'node-tests/fixtures/config/deploy.js',
          hooks: ['willDeploy', 'upload']
        });
        return task.setup().then(function(){
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
  });

  describe('executing the pipeline task', function() {
    it ('executes the pipeline, passing in the deployment context', function() {
      var pipelineExecuted = false;
      var deployment;

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
        commandLineArgs: {revision: '123abc'},
        hooks: ['willDeploy', 'upload'],
        pipeline: {
          execute: function(context) {
            pipelineExecuted = true;
            deployment = context.deployment;
            return Promise.resolve();
          }
        }
      });

      return expect(task.run()).to.be.fulfilled
        .then(function() {
          expect(pipelineExecuted).to.be.true;
          expect(deployment.ui).to.eq(mockUi);
          expect(deployment.project).to.eq(project);
          expect(deployment.deployEnvironment).to.eq('development');
          expect(deployment.config.build.buildEnv).to.eq('development');
          expect(deployment.commandLineArgs.revision).to.eq('123abc');
        });
    });
  });
});
