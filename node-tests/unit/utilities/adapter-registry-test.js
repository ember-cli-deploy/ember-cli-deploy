var Adapter         = require('../../../utilities/adapter');
var AdapterRegistry = require('../../../utilities/adapter-registry');
var CoreObject      = require('core-object');
var UnknownAdapter  = require('../../../utilities/assets/unknown');
var expect          = require('chai').expect;

var MockRedisAdapter = Adapter.extend();
var MockS3Adapter    = Adapter.extend();

describe('AdapterRegistry', function() {
  describe('lookup', function() {
    it('looks up adapters by type and name', function() {
      var adapterRegistry = new AdapterRegistry({
        adapters: {
          index: {
            redis: MockRedisAdapter
          },

          assets: {
            s3: MockS3Adapter
          }
        }
      });

      var IndexAdapter = adapterRegistry.lookup('index', 'redis');

      expect(IndexAdapter).to.eq(MockRedisAdapter);
    });

    it('returns the `UnknownAdapter` for unknown adapter types', function() {
      var adapterRegistry = new AdapterRegistry();

      expect(adapterRegistry.lookup('index', 'trolol')).to.eq(UnknownAdapter);
    })
  });
});
