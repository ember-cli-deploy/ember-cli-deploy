var Promise      = require('ember-cli/lib/ext/promise');
var PipelineTask = require('../../../lib/tasks/pipeline');
var expect       = require('chai').expect;
var assert       = require('chai').assert;

describe('PipelineTask', function() {
  var mockProject   = {addons: []};
  var mockConfig    = {};
  var mockAppConfig = {};
  var mockUi        = {};

  describe('creating a new instance', function() {
    it ('raises an error if project is not provided', function() {
      var fn = function() {
        new PipelineTask({});
      };

      expect(fn).to.throw('No project passed to pipeline task');
    });

    it ('raises an error if deploy config is not provided', function() {
      var fn = function() {
        new PipelineTask({
          project: mockProject
        });
      };

      expect(fn).to.throw('No deploy config passed to pipeline task');
    });

    it ('raises an error if app config is not provided', function() {
      var fn = function() {
        new PipelineTask({
          project: mockProject,
          config: mockConfig
        });
      };

      expect(fn).to.throw('No app config passed to pipeline task');
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

    it ('creates the deployment context object', function() {
      var task = new PipelineTask({
        project: mockProject,
        config: mockConfig,
        appConfig: mockAppConfig,
        ui: mockUi
      });

      var context = task._context;

      expect(context.ui).to.equal(mockUi);
      expect(context.config).to.equal(mockConfig);
      expect(context.appConfig).to.equal(mockAppConfig);
      expect(context.data).to.eql({});
    });

    it('registers  addons with correct keywords that create the deploy plugin', function() {
      var project = {
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
                willDeploy: function() {},
                upload: function() {},
                didDeploy: function() {}
              };
            }
          }
        ]
      };

      var task = new PipelineTask({
        project: project,
        ui: mockUi,
        config: mockConfig,
        appConfig: mockAppConfig
      });

      var registeredHooks = task._deploymentHooks;

      expect(registeredHooks.willDeploy[0]).to.be.a('function');
      expect(registeredHooks.upload[0]).to.be.a('function');
      expect(registeredHooks.didDeploy[0]).to.be.a('function');
    });

    it('does not register addons missing the correct keywords', function() {
      var project = {
        addons: [
          {
            name: 'ember-cli-deploy-test-plugin',
            pkg: {
              keywords: [ ]
            },
            createDeployPlugin: function() {
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
        config: mockConfig,
        appConfig: mockAppConfig
      });

      var registeredHooks = task._deploymentHooks;

      expect(registeredHooks.willDeploy[0]).to.be.undefined;
    });

    it('does not register addons that don\'t implement the createDeployPlugin function', function() {
      var project = {
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
        config: mockConfig,
        appConfig: mockAppConfig
      });

      var registeredHooks = task._deploymentHooks;

      expect(registeredHooks.willDeploy[0]).to.be.undefined;
    });
  });

  describe('running the pipeline task', function() {
    it ('runs the hook function, passing in the deployment context', function(done) {
      var ctx;
      var project = {
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
                willDeploy: function(context) {
                  ctx = context;
                  return Promise.resolve();
                }
              };
            }
          }
        ]
      };

      var task = new PipelineTask({
        project: project,
        ui: mockUi,
        config: mockConfig,
        appConfig: mockAppConfig
      });

      task.run()
        .then(function() {
          expect(ctx.ui).to.equal(mockUi);
          expect(ctx.config).to.equal(mockConfig);
          expect(ctx.appConfig).to.equal(mockAppConfig);
          expect(ctx.data).to.eql({});
          done();
        })
        .catch(function() {
          done(arguments[0]);
        });
    });

    describe('running all deploy hooks', function() {
      it ('runs functions for all hooks', function(done) {
        var functionsRun = 0;
        var fn = function() { functionsRun += 1;}

        var project = {
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
                  willDeploy: fn,
                  build: fn,
                  upload: fn,
                  activate: fn,
                  didDeploy: fn,
                };
              }
            }
          ]
        };

        var task = new PipelineTask({
          project: project,
          ui: mockUi,
          config: mockConfig,
          appConfig: mockAppConfig
        });

        task.run()
          .then(function() {
            expect(functionsRun).to.equal(5);
            done();
          })
          .catch(function() {
            done(arguments[0]);
          });
      });
    });

    describe('running specific deploy hooks', function() {
      it ('runs only the functions specified', function(done) {
        var functionsRun = 0;
        var fn = function() { functionsRun += 1;}

        var project = {
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
                  willDeploy: fn,
                  build: fn,
                  upload: fn,
                  activate: fn,
                  didDeploy: fn,
                };
              }
            }
          ]
        };

        var task = new PipelineTask({
          project: project,
          ui: mockUi,
          config: mockConfig,
          appConfig: mockAppConfig
        });

        task.run(['build', 'activate', 'didDeploy'])
          .then(function() {
            expect(functionsRun).to.equal(3);
            done();
          })
          .catch(function() {
            done(arguments[0]);
          });
      });
    });
  });
});
