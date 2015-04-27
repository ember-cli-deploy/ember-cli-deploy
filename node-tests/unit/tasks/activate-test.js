var expect       = require('chai').expect;
var sinon        = require('sinon');
var MockUI       = require('ember-cli/tests/helpers/mock-ui');
var ActivateTask = require('../../../lib/tasks/activate');

var task;
var ui;
var project;
var spy;

describe('ListTask', function() {
  beforeEach(function() {
    ui = new MockUI();
    spy = sinon.spy();

    var deployPlugin = {
      type: 'ember-deploy-addon',
      name: 'Activate-Plugin',
      hooks: {
        activate: spy
      }

    }
    project = {
      addons: [
        deployPlugin
      ]
    };

    task = new ActivateTask({
      ui: ui,
      project: project,
      deployment: {
        data: {}
      }
    });
  });

  describe('run', function() {
    it('executes the `activate`-hook that deploy-plugins can implement', function() {
      task.run()
        .then(function() {
          expect(spy.calledOnce).to.be.true;
        });
    });
  });
});
