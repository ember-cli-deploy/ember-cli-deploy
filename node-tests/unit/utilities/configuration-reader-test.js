var ConfigurationReader = require('../../../lib/utilities/configuration-reader');
var expect = require('chai').expect;
var path = require('path');
var MockUI = require('ember-cli/tests/helpers/mock-ui');
var EOL    = require('os').EOL;
var chalk  = require('chalk');

describe('ConfigurationReader', function() {
  var ui, project;

  beforeEach(function() {
    ui = new MockUI();
    project = { name: function(){ return 'foo'; }}
  });

  describe('environment settings', function() {
    it('knows about its passed _environment', function() {
      var config = new ConfigurationReader({
        environment: 'staging',
        ui: ui,
        project: project
      });

      expect(config._environment).to.equal('staging');
    });

    it('`development` is default when no environment is passed', function() {
      var config = new ConfigurationReader({
        ui: ui,
        project: project
      });

      expect(config._environment).to.equal('development');
    });
  });

  describe('configuration settings', function() {
    it('reads a passed json deploy-config-file if one is passed', function() {
      var configPath        = './node-tests/fixtures/config/deploy.json';
      var root              = process.cwd();
      var fixtureConfigPath = path.join(root, configPath);
      var expectedConfig    = require(fixtureConfigPath);

      var config = new ConfigurationReader({
        configFile: configPath,
        ui: ui,
        project: project
      });

      expect(ui.output).to.include('DEPRECATION: Using a .json file for deployment configuration is deprecated. Please use a .js file instead');
      expect(config._config).to.equal(expectedConfig);
    });

    it('reads a passed js deploy-config-file if one is passed', function() {
      var configPath        = './node-tests/fixtures/config/deploy.js';
      var root              = process.cwd();
      var fixtureConfigPath = path.join(root, configPath);
      var expectedConfig    = require(fixtureConfigPath);

      var config = new ConfigurationReader({
        configFile: configPath,
        ui: ui,
        project: project
      });

      expect(config._config).to.equal(expectedConfig);
    });

    it('uses `./config/deploy.js` as default when no config is passed', function() {
      var root           = process.cwd();
      var expectedConfig = require(path.join(root, './config/deploy.js'));

      var config = new ConfigurationReader({
        ui: ui,
        project: project
      });

      expect(config._config).to.equal(expectedConfig)
    });

    it('raises an error in the case of a passed deploy-config-file that doesn\'t exist', function() {
      var configPath        = './node-tests/fixtures/config/does-not-exist.js';
      var root              = process.cwd();

      expect(function() {
        var config = new ConfigurationReader({
          configFile: configPath,
          ui: ui,
          project: project
        });
      }).to.throw('Cannot load configuration file \'' + path.join(root, configPath) + '\'. Note that the default location of the ember-cli-deploy config file is now \'config/deploy.js\'');
    });

    it('raises an error if a config doesn\'t exist for the current environment', function() {
      var configPath = './node-tests/fixtures/config/deploy.js';

      expect(function() {
        new ConfigurationReader({
          configFile: configPath,
          ui: ui,
          project: project,
          environment: 'non-existent-env'
        });
      }).to.throw(/You are using the `non-existent-env` environment/);
    });
  });

  describe('store settings', function() {
    it('proxies the store settings for the passed environment', function() {
      var ENVs    = ['development', 'staging'];
      var root    = process.cwd();
      var cfgFile = require(path.join(root, './node-tests/fixtures/config/deploy.js'));

      ENVs.forEach(function(ENV) {
        var expected = cfgFile[ENV].store;

        var config = new ConfigurationReader({
          environment: ENV,
          ui: ui,
          project: project
        }).config;

        expect(config.get('store')).to.deep.equal(expected);
      });
    });
  });

  describe('assets settings', function() {
    it('proxies the asset setting for the passed environment', function() {
      var ENVs    = ['development', 'staging'];
      var root    = process.cwd();
      var cfgFile = require(path.join(root, './node-tests/fixtures/config/deploy.js'));

      ENVs.forEach(function(ENV) {
        var expected = cfgFile[ENV].assets;

        var config = new ConfigurationReader({
          environment: ENV,
          ui: ui,
          project: project
        }).config;

        expect(config.get('assets')).to.deep.equal(expected);
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
