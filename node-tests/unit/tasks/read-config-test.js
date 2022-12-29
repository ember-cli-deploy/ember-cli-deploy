var ReadConfigTask = require('../../../lib/tasks/read-config');
var assert         = require('../../helpers/assert');
var path           = require('path');

describe('ReadConfigTask', function() {
  describe('#run', function() {
    it('reads from the config file', function(done){
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [],
        pkg: {}
      };

      var task = new ReadConfigTask({
        project: project,
        deployTarget: 'development',
        deployConfigFile: 'node-tests/fixtures/config/deploy.js'
      });
      task.run().then(function(config){
        assert.equal(config.build.environment, 'development');
        assert.equal(config.s3.bucket, 'shineonyoucrazy');
        done();
      });
    });

    var configFileNotFoundExceptionPattern = /Deploy config does not exist at/;
    it('throws an exception if deployConfigFile cannot be found', function() {
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [],
        pkg: {}
      };

      var fn = function () {
        new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigFile: path.join(process.cwd(), 'node-tests/fixtures/config/this-config-does-not-exist.js')
        }).run();
      };

      assert.throws(fn, configFileNotFoundExceptionPattern, 'config file does not exist but exception is not thrown');
    });

    it('accepts an absolute deployConfigFile', function() {
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [],
        pkg: {}
      };

      var fn = function () {
        new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigFile: path.join(process.cwd(), 'node-tests/fixtures/config/deploy.js')
        }).run();
      };

      assert.doesNotThrow(fn, configFileNotFoundExceptionPattern, 'config file could not be read');
    });

    describe('addon', function() {
      it('reads from tests/dummy/config/deploy.js first', function(done){
        var project = {
          name: function() {return 'test-project';},
          root: path.join(process.cwd(), 'node-tests/fixtures/addon'),
          addons: [],
          pkg: { 'ember-addon': {} }
        };

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development'
        });
        task.run().then(function(config){
          assert.equal(config.build.environment, 'development');
          assert.equal(config.s3.bucket, 'testsdummyconfig');
          done();
        });
      });

      it('reads from config/deploy.js second', function(done){
        var project = {
          name: function() {return 'test-project';},
          root: path.join(process.cwd(), 'node-tests/fixtures'),
          addons: [],
          pkg: { 'ember-addon': {} }
        };

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development'
        });
        task.run().then(function(config){
          assert.equal(config.build.environment, 'development');
          assert.equal(config.s3.bucket, 'shineonyoucrazy');
          done();
        });
      });

      it('still allows override', function(done){
        var project = {
          name: function() {return 'test-project';},
          root: process.cwd(),
          addons: [],
          pkg: { 'ember-addon': {} }
        };

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigFile: 'node-tests/fixtures/config/deploy.js'
        });
        task.run().then(function(config){
          assert.equal(config.build.environment, 'development');
          assert.equal(config.s3.bucket, 'shineonyoucrazy');
          done();
        });
      });
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
          addons: [],
          pkg: {}
        };
      });
      it('sets the process.env vars if a .env file exists for deploy environment', function() {
        assert.isUndefined(process.env.ENVTEST);

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigFile: 'config/deploy.js'
        });
        task.run();

        assert.equal(process.env.ENVTEST, 'SUCCESS');
      });

      it('sets the process.env vars from main .env file', function() {
        assert.isUndefined(process.env.SHARED);

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigFile: 'config/deploy.js'
        });
        task.run();

        assert.equal(process.env.SHARED, 'shared-key');
      });

      it('overrides vars from main .env file if defined in deploy environment .env file', function() {
        assert.isUndefined(process.env.OVERRIDDEN);

        var task = new ReadConfigTask({
          project: project,
          deployTarget: 'development',
          deployConfigFile: 'config/deploy.js'
        });
        task.run();

        assert.equal(process.env.OVERRIDDEN, 'deploy-env-flavor');
      });
    });


    it('rejects an empty config', function(done) {
      var project = {
        name: function() {return 'test-project';},
        root: process.cwd(),
        addons: [],
        pkg: {}
      };

      var task = new ReadConfigTask({
        project: project,
        deployTarget: 'development',
        deployConfigFile: 'node-tests/fixtures/config/empty.js'
      });
      task.run().then(function(){
        assert.fail('empty config file resolved', 'empty config file rejected');
      }).catch(function(error) {
        assert.match(error, /Config is undefined for/);
        done();
      });
    });
  });

});
