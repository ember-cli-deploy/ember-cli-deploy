var expect   = require('chai').expect;
var sinon    = require('sinon');
var MockUI   = require('ember-cli/tests/helpers/mock-ui');
var ListTask = require('../../../lib/tasks/list');

var task;
var ui;
var project;
var spy;

describe('ListTask', function() {
  beforeEach(function() {
    ui = new MockUI();
    spy = sinon.spy();

    var listPlugin = {
      type: 'ember-deploy-addon',
      name: 'List-Plugin',
      hooks: {
        discoverVersions: spy
      }

    }
    project = {
      addons: [
        listPlugin
      ]
    };

    task = new ListTask({
      ui: ui,
      project: project,
      deployment: {
        data: {}
      }
    });
  });

  describe('run', function() {
    it('executes the `discoverVersions`-hook that deploy-plugins can implement', function() {
      task.run()
        .then(function() {
          expect(spy.calledOnce).to.be.true;
        });
    });
  });
});
