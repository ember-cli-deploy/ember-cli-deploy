var assert  = require('ember-cli/tests/helpers/assert');

describe ('ember-cli-deploy', function() {
  var subject;
  beforeEach(function() {
    subject = require('../../index.js');
  });
  describe('postBuild', function() {
    it('requires an app', function() {
      assert(!subject.postBuild(), 'returns false');
    });

    it('requires a deployTarget', function() {
      var context = {
        app: {
          options: {
            emberCLIDeploy: {
              runOnPostBuild: null
            }
          }
        }
      };

      assert(!subject.postBuild.apply(context));
    });

    it('reads the config', function() {
      var context = {
        project: {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: []
        },
        app: {
          options: {
            emberCLIDeploy: {
              runOnPostBuild: 'production',
              configFile: 'node-tests/fixtures/config/deploy.js'
            }
          }
        }
      };

      assert(subject.postBuild.apply(context));
    });
  });
});
