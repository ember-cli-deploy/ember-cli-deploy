/* jshint expr:true */
var DeployTask = require('../../../lib/utilities/deploy-task');
var expect = require('chai').expect;
var RSVP = require('rsvp');

var deployTask;
var hookCalled;
var indexHTML;

describe('DeployTask', function() {
  it('has multiple deployment hooks available', function() {
    var hooks = [
      'willDeploy',
      'build',
      'upload',
      'activate',
      'didDeploy'
    ];

    deployTask = new DeployTask();

    hooks.forEach(function(hook) {
      expect(deployTask.deploymentHooks[hook]).to.be.ok;
    });
  });

  context('plugin hooks are merged into deployment pipeline', function() {
    beforeEach(function() {
      hookCalled = false;
      indexHTML = '';

      var deploymentPlugin = {
        type: 'ember-deploy-addon',
        name: 'Deployment-Plugin',
        hooks: {
          upload: function(html) {
            indexHTML = html;
          },

          didDeploy: function() {
            hookCalled = true;
          }
        }
      };

      var project = {
        addons: [
          deploymentPlugin
        ]
      };

      deployTask = new DeployTask({
        project: project
      });
    });

    it('knows about hooks from installed `ember-cli-deploy`-addons', function() {
      expect(deployTask.deploymentHooks.didDeploy.length).to.be.gt(0);
    });

    context('#executeDeploymentHook', function() {
      it('can execute deployment-hooks registered from installed `ember-cli-deploy`-addons', function() {
        deployTask.executeDeploymentHook('didDeploy');

        expect(hookCalled).to.be.ok;
      });

      it('can pass context to the called hooks', function() {
        var newIndexHTML = '<h2>Welcome to Ember.js</h2>'

        deployTask.executeDeploymentHook('upload', newIndexHTML);

        expect(indexHTML).to.eql(newIndexHTML);
      });

      it('returns a promise', function() {
        var promise = deployTask.executeDeploymentHook('didDeploy');

        expect(promise.then).to.be.ok;
      });

      it("allows hooks to work with the task's deployment object", function(done) {
        var deployment = {
          data: {
            started: false,
            success: false
          }
        };

        var deploymentAddon = {
          type: 'ember-deploy-addon',
          name: 'Deployment-Plugin',
          hooks: {
            willDeploy: function() {
              this.deployment.data.started = true;
              return RSVP.resolve();
            },

            didDeploy: function() {
              this.deployment.data.success = true;
              return RSVP.resolve();
            }
          }
        };

        var project = {
          addons: [deploymentAddon]
        }

        deployTask = new DeployTask({
          project:project,
          deployment: deployment,
          run: function() {
            return this.executeDeploymentHook('willDeploy')
              .then(this.executeDeploymentHook('didDeploy'));
          }
        });

        deployTask.run()
          .then(function() {
            expect(deployment.data.started).to.be.ok;
            expect(deployment.data.success).to.be.ok;
            done();
          });
      });
    });
  });
});
