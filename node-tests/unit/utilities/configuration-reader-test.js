var ConfigurationReader = require('../../../utilities/configuration-reader');
var expect = require('chai').expect;
var path = require('path');

describe('configuration-reader', function() {
  it('should be testable', function() {
    expect(ConfigurationReader).to.exist;
  });

  describe('environment settings', function() {
    it('knows about its passed _environment', function() {
      var config = new ConfigurationReader({
        environment: 'staging'
      });

      expect(config._environment).to.equal('staging');
    });

    it('`development` is default when no environment is passed', function() {
      var config = new ConfigurationReader();

      expect(config._environment).to.equal('development');
    });
  });

  describe('configuration settings', function() {
    it('reads a passed config-file if one is passed', function() {
      var configPath        = './node-tests/fixtures/deploy.json';
      var root              = process.cwd();
      var fixtureConfigPath = path.join(root, configPath);
      var expectedConfig    = require(fixtureConfigPath);

      var config = new ConfigurationReader({
        configFile: configPath
      });

      expect(config._config).to.equal(expectedConfig);
    });

    it('uses `./deploy.json` as default when no config is passed', function() {
      var root           = process.cwd();
      var expectedConfig = require(path.join(root, './deploy.json'));

      var config = new ConfigurationReader();

      expect(config._config).to.equal(expectedConfig)
    });
  });

  describe('store settings', function() {
    it('proxies the store settings for the passed environment', function() {
      var ENVs    = ['development', 'staging'];
      var root    = process.cwd();
      var cfgFile = require(path.join(root, './node-tests/fixtures/deploy.json'));

      ENVs.forEach(function(ENV) {
        var expected = cfgFile[ENV].store;

        var config = new ConfigurationReader({
          environment: ENV
        });

        expect(config.store).to.deep.equal(expected);
      });
    });
  });

  describe('assets settings', function() {
    it('proxies the asset setting for the passed environment', function() {
      var ENVs    = ['development', 'staging'];
      var root    = process.cwd();
      var cfgFile = require(path.join(root, './node-tests/fixtures/deploy.json'));

      ENVs.forEach(function(ENV) {
        var expected = cfgFile[ENV].assets;

        var config = new ConfigurationReader({
          environment: ENV
        });

        expect(config.assets).to.deep.equal(expected);
      });
    });
  })
});
