var Promise      = require('ember-cli/lib/ext/promise');
var DeployTask = require('../../../lib/tasks/deploy');
var expect       = require('../../helpers/expect');
var assert       = require('chai').assert;

describe('DeployTask', function() {
  var mockProject   = {addons: []};
  var mockConfig    = {};
  var mockUi        = { write: function() {},  writeError: function() {} };

  describe('creating and setting up a new instance', function() {

    describe('detects that shouldActivate', function() {
      it('is passed as a value', function() {
        var deploy = new DeployTask({
          project: mockProject,
          ui: mockUi,
          deployTarget: 'development-postbuild',
          deployConfigFile: 'node-tests/fixtures/config/deploy-postbuild.js',
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
          deployConfigFile: 'node-tests/fixtures/config/deploy-postbuild.js',
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
          deployConfigFile: 'node-tests/fixtures/config/deploy.js',
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
      var pipelineContext;

      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [ ]
      };

      var task = new DeployTask({
        project: project,
        ui: mockUi,
        deployTarget: 'development',
        deployConfigFile: 'node-tests/fixtures/config/deploy.js',
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
  });

});
