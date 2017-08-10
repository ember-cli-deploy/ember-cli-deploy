var assert = require('../helpers/assert');

describe ('Installation Blueprint', function() {
  var subject;
  beforeEach(function() {
    subject = require('../../blueprints/ember-cli-deploy/index.js');
  });
  describe('afterInstall', function() {
    it('emits a message if no deploy plugins are installed', function() {
      var called = false;
      var context = {
        project: {
          addons: []
        },
        ui: {
          write: function(message) {
            assert(/ember-cli-deploy needs plugins to actually do the deployment work/.test(message));
            called = true;
          }
        }
      };

      subject.afterInstall.call(context);
      assert(called, 'ui.write() was called');
    });

    it('emits no message if a deploy plugin is found', function() {
      var called = false;
      var context = {
        project: {
          addons: [{
            pkg: {
              keywords: ['ember-cli-deploy-plugin']
            }
          }]
        },
        ui: {
          write: function() {
            called = true;
          }
        }
      };

      subject.afterInstall.call(context);
      assert(!called, 'ui.write() was not called');
    });

    it('emits no message if a deploy plugin pack is found', function() {
      var called = false;
      var context = {
        project: {
          addons: [{
            pkg: {
              keywords: ['ember-cli-deploy-plugin-pack']
            }
          }]
        },
        ui: {
          write: function() {
            called = true;
          }
        }
      };

      subject.afterInstall.call(context);
      assert(!called, 'ui.write() was not called');
    });
  });
});
