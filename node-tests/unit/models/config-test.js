var Config = require('../../../lib/models/config');
var expect = require('chai').expect;

describe('Config', function() {
  function createConfig(projectName, configJson) {
    return new Config({
      project: { name: function(){ return projectName; } },
      rawConfig: configJson
    });
  }

  describe('manifestPrefix', function(){
    it('defaults to project name', function() {
      var config = createConfig('tomster', {});
      expect(config.get('manifestPrefix')).to.eq('tomster');
    });

    it('allows configuration', function() {
      var config = createConfig('tomster', { manifestPrefix: 'seldenator' });
      expect(config.get('manifestPrefix')).to.eq('seldenator');
    });
  });

  describe('buildEnv', function(){
    it('defaults to production', function() {
      var config = createConfig('tomster', {});
      expect(config.get('buildEnv')).to.eq('production');
    });
    it('allows configuration', function() {
      var config = createConfig('tomster', { buildEnv: 'chocula' });
      expect(config.get('buildEnv')).to.eq('chocula');
    });
  });

  describe('store.type', function(){
    it('defaults to redis', function() {
      var config = createConfig('tomster', {});
      expect(config.get('store.type')).to.eq('redis');
    });
    it('allows configuration', function() {
      var config = createConfig('tomster', { store: { type: 'cassandra' } });
      expect(config.get('store.type')).to.eq('cassandra');
    });
  });

  describe('store.manifestSize', function(){
    it('defaults to 10', function() {
      var config = createConfig('tomster', {});
      expect(config.get('store.manifestSize')).to.eq(10);
    });
    it('allows configuration', function() {
      var config = createConfig('tomster', { store: { manifestSize: 42 } });
      expect(config.get('store.manifestSize')).to.eq(42);
    });
  });

  describe('assets.type', function(){
    it('defaults to s3', function() {
      var config = createConfig('tomster', {});
      expect(config.get('assets.type')).to.eq('s3');
    });
    it('allows configuration', function() {
      var config = createConfig('tomster', { assets: { type: 'akamai' } });
      expect(config.get('assets.type')).to.eq('akamai');
    });
  });

  describe('assets.gzip', function(){
    it('defaults to true', function() {
      var config = createConfig('tomster', {});
      expect(config.get('assets.gzip')).to.eq(true);
    });
    it('allows configuration', function() {
      var config = createConfig('tomster', { assets: { gzip: false } });
      expect(config.get('assets.gzip')).to.eq(false);
    });
  });

  describe('assets.gzipExtensions', function(){
    it('defaults to js,css,svg', function() {
      var config = createConfig('tomster', {});
      expect(config.get('assets.gzipExtensions')).to.deep.equal(['js', 'css', 'svg']);
    });
    it('allows configuration', function() {
      var config = createConfig('tomster', { assets: { gzipExtensions: ['js', 'css'] } });
      expect(config.get('assets.gzipExtensions')).to.deep.equal(['js', 'css']);
    });
  });

  describe('tagging', function(){
    it('defaults to sha', function() {
      var config = createConfig('tomster', {});
      expect(config.get('tagging')).to.equal('sha');
    });
    it('allows configuration', function() {
      var config = createConfig('tomster', { tagging: 'yapp-custom' });
      expect(config.get('tagging')).to.equal('yapp-custom');
    });
  });
});
