var ConfigurationReader = require('../../../lib/utilities/configuration-reader');
var expect = require('chai').expect;
var path = require('path');
var MockUI = require('ember-cli/tests/helpers/mock-ui');
var Promise = require('ember-cli/lib/ext/promise');
var EOL    = require('os').EOL;
var chalk  = require('chalk');

describe('ConfigurationReader', function() {
  var ui, project;

  beforeEach(function() {
    ui = new MockUI();
    project = { name: function(){ return 'foo'; }}
  });

  describe('environment settings', function() {
    it('knows about its passed environment', function() {
      var reader = new ConfigurationReader({
        environment: 'staging',
        ui: ui,
        project: project
      });

      expect(reader.environment).to.equal('staging');
    });

    it('`development` is default when no environment is passed', function() {
      var reader = new ConfigurationReader({
        ui: ui,
        project: project
      });

      expect(reader.environment).to.equal('development');
    });
  });

  describe('configuration settings', function() {
    it('throws an error when  passed a json deploy-config-file', function() {
      var configPath        = './node-tests/fixtures/config/deploy.json';
      var root              = process.cwd();
      var fixtureConfigPath = path.join(root, configPath);
      var expectedConfig    = require(fixtureConfigPath);

      return new ConfigurationReader({
        configFile: configPath,
        ui: ui,
        project: project
      }).read().then(function(){
        expect(false).to.equal(true);
      }, function(err){
        expect(err.message).to.match(/Cannot load configuration file/);
      });
    });

    it('reads a passed js deploy-config-file if one is passed', function() {
      var configPath        = './node-tests/fixtures/config/deploy.js';
      var root              = process.cwd();
      var fixtureConfigPath = path.join(root, configPath);
      var expectedConfig    = require(fixtureConfigPath)('development');

      return new ConfigurationReader({
        configFile: configPath,
        ui: ui,
        project: project
      }).read().then(function(config){
        expect(config._config).to.eql(expectedConfig);
      });
    });

    it('uses `./config/deploy.js` as default when no config is passed', function() {
      var root           = process.cwd();
      var expectedConfig = require(path.join(root, './config/deploy.js'))('development');

      return new ConfigurationReader({
        ui: ui,
        project: project
      }).read().then(function(config){
        expect(config._config).to.eql(expectedConfig)
      });

    });

    it('raises an error in the case of a passed deploy-config-file that doesn\'t exist', function() {
      var configPath        = './node-tests/fixtures/config/does-not-exist.js';
      var root              = process.cwd();
      return new ConfigurationReader({
        configFile: configPath,
        ui: ui,
        project: project
      }).read().then(function(){
        expect(false).to.equal(true);
      }, function(err){
        expect(err.message).to.equal('Cannot load configuration file \'' + path.join(root, configPath) + '\'. Note that the default location of the ember-cli-deploy config file is now \'config/deploy.js\'');
      });
    });

    it('raises an error if a config doesn\'t exist for the current environment', function() {
      var configPath = './node-tests/fixtures/config/deploy.js';
      return new ConfigurationReader({
        configFile: configPath,
        ui: ui,
        project: project,
        environment: 'non-existent-env'
      }).read().then(function(){
        expect(false).to.equal(true);
      }, function(err){
        expect(err.message).to.match(/You are using the `non-existent-env` environment/);
      });
    });
  });

  describe('store settings', function() {
    it('proxies the store settings for the passed environment', function() {
      var ENVs    = ['development', 'staging'];
      var root    = process.cwd();
      var cfgFile = require(path.join(root, './node-tests/fixtures/config/deploy.js'));

      return Promise.map(ENVs, function(env) {
        var expected = cfgFile(env).store;

        return new ConfigurationReader({
          environment: env,
          ui: ui,
          project: project
        }).read().then(function(config){
          expect(config.get('store')).to.deep.equal(expected);
        });
      });
    });
  });

  describe('assets settings', function() {
    it('proxies the asset setting for the passed environment', function() {
      var ENVs    = ['development', 'staging'];
      var root    = process.cwd();
      var cfgFile = require(path.join(root, './node-tests/fixtures/config/deploy.js'));

      return Promise.map(ENVs, function(env) {
        var expected = cfgFile(env).assets;

        return new ConfigurationReader({
          environment: env,
          ui: ui,
          project: project
        }).read().then(function(config){
          expect(config.get('assets')).to.deep.equal(expected);
        });
      });
    });
  });

  describe('materialized settings', function() {
    it('proxies the materialized settings for the passed environment', function() {
      var ENVs    = ['development', 'staging'];
      var root    = process.cwd();
      var cfgFile = require(path.join(root, './node-tests/fixtures/config-with-defaults/deploy.js'));

      ENVs.forEach(function(ENV) {
        var expected = cfgFile[ENV];

        var config = new ConfigurationReader({
          environment: ENV,
          ui: ui,
          project: project
        }).config;

        expect(config._materialize()).to.deep.equal(expected);
      });
    });
  })

});
