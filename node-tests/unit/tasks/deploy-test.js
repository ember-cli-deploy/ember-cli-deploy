var Promise      = require('ember-cli/lib/ext/promise');
var DeployTask = require('../../../lib/tasks/deploy');
var expect       = require('../../helpers/expect');

describe('DeployTask', function() {
  var mockProject = {addons: []};
  var mockPostBuildConfig = {
    pipeline: {
      activateOnDeploy: true
    }
  };
  var mockDeployConfig = {
    build: {
      buildEnv: 'development'
    }
  };
  var mockUi = { write: function() {},  writeError: function() {} };

  describe('creating and setting up a new instance', function() {

    describe('detects that shouldActivate', function() {
      it('is passed as a value', function() {
        var deploy = new DeployTask({
          project: mockProject,
          ui: mockUi,
          deployTarget: 'development-postbuild',
          config: mockPostBuildConfig,
          shouldActivate: true
        });
        expect(deploy.shouldActivate).to.eq(true);
      });

      it('is specified in the deploy config', function() {
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: []
        };
        var deploy = new DeployTask({
          project: project,
          ui: mockUi,
          deployTarget: 'development-postbuild',
          config: mockPostBuildConfig,
        });
        expect(deploy.shouldActivate).to.eq(true);
      });

      it('is passed as a commandLine option', function() {
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: []
        };
        var deploy = new DeployTask({
          project: project,
          ui: mockUi,
          deployTarget: 'development-postbuild',
          config: mockDeployConfig,
          commandOptions: {
            activate: true
          }
        });
        expect(deploy.shouldActivate).to.eq(true);
      });
  });

  describe('executing the deployTask', function() {
    it ('executes the pipelineTask', function() {
      var pipelineExecuted = false;

      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [ ]
      };

      var task = new DeployTask({
        project: project,
        ui: mockUi,
        deployTarget: 'development',
        config: mockDeployConfig,
        _pipeline: {
          run: function() {
            pipelineExecuted = true;
            return Promise.resolve();
          }
        }
      });

      return expect(task.run()).to.be.fulfilled
        .then(function() {
          expect(pipelineExecuted).to.eq(true);
        });
      });
    });

    describe('setting environment variables from .env', function() {
      beforeEach(function(){
        delete process.env.ENVTEST;
      });
    });

  });

});
