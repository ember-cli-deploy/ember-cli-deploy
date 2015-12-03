var Promise      = require('ember-cli/lib/ext/promise');
var ReadConfigTask = require('../../../lib/tasks/read-config');
var expect       = require('../../helpers/expect');
var assert       = require('chai').assert;

describe('ReadConfigTask', function() {
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

  describe('#run', function() {
    it('reads from the config file', function(done){
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: []
      };

      var task = new ReadConfigTask({
        project: project,
        deployTarget: 'development',
        deployConfigPath: 'node-tests/fixtures/config/deploy.js'
      });
      task.run().then(function(config){
        assert.equal(config.build.environment, 'development');
        assert.equal(config.s3.bucket, 'shineonyoucrazy');
        done();
      });
    });

    it('accepts an absolute deployConfigPath', function() {
      var fn = function () {
        new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigPath: path.join(process.cwd(), 'node-tests/fixtures/config/deploy.js')
        }).run();
      };

      assert.doesNotThrow(fn, /Cannot find module/, 'config file could not be read');
    });

    describe('setting environment variables from .env', function() {
      beforeEach(function(){
        delete process.env.ENVTEST;
      });
      it('sets the process.env vars if a .env file exists for deploy environment', function() {
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: []
        };

        assert.isUndefined(process.env.ENVTEST);

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigPath: 'node-tests/fixtures/config/deploy.js'
        });
        task.run();

        assert.equal(process.env.ENVTEST, 'SUCCESS');
      });
    });

  });

});
