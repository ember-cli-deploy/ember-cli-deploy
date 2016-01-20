var ReadConfigTask = require('../../../lib/tasks/read-config');
var assert       = require('chai').assert;
var path         = require('path');

describe('ReadConfigTask', function() {
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
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: []
      };

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
      var project;
      var customDotEnvVars = [
        'OVERRIDDEN',
        'SHARED',
        'ENVTEST'
      ];

      beforeEach(function(){
        customDotEnvVars.forEach(function(dotEnvVar) {
          delete process.env[dotEnvVar];
        });

        project = {
          name: function() {return 'test-project';},
          root: path.join(process.cwd(), 'node-tests/fixtures'),
          addons: []
        };
      });
      it('sets the process.env vars if a .env file exists for deploy environment', function() {
        assert.isUndefined(process.env.ENVTEST);

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigPath: 'config/deploy.js'
        });
        task.run();

        assert.equal(process.env.ENVTEST, 'SUCCESS');
      });

      it('sets the process.env vars from main .env file', function() {
        assert.isUndefined(process.env.SHARED);

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigPath: 'config/deploy.js'
        });
        task.run();

        assert.equal(process.env.SHARED, 'shared-key');
      });

      it('overrides vars from main .env file if defined in deploy environment .env file', function() {
        assert.isUndefined(process.env.OVERRIDDEN);

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigPath: 'config/deploy.js'
        });
        task.run();

        assert.equal(process.env.OVERRIDDEN, 'deploy-env-flavor');
      });
    });

  });

});
