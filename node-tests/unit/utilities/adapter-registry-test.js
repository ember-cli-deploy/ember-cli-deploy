/* jshint expr:true */
var Adapter         = require('../../../lib/utilities/adapter');
var AdapterRegistry = require('../../../lib/utilities/adapter-registry');
var UnknownAdapter  = require('../../../lib/utilities/assets/unknown');
var expect          = require('chai').expect;

var MockRedisAdapter = Adapter.extend();
var MockS3Adapter    = Adapter.extend();

var bundledAdapters;

describe('AdapterRegistry', function() {
  beforeEach(function() {
    bundledAdapters  = {
      index: {
        redis: MockRedisAdapter
      },

      assets: {
        s3: MockS3Adapter
      }
    };
  });

  describe('lookup', function() {
    it('looks up adapters by type and name', function() {
      var adapterRegistry = new AdapterRegistry({
        adapters: bundledAdapters
      });

      var IndexAdapter = adapterRegistry.lookup('index', 'redis');

      expect(IndexAdapter).to.eq(MockRedisAdapter);
    });

    it('returns the `UnknownAdapter` for unknown adapter types', function() {
      var adapterRegistry = new AdapterRegistry();

      expect(adapterRegistry.lookup('index', 'trolol')).to.eq(UnknownAdapter);
    });
  });

  describe('adapters can be added via addons', function() {
    it('registers adapters via the project addons', function() {
      var MockAdapterA = Adapter.extend();
      var MockAdapterB = Adapter.extend();
      var project = {
        addons: [
          {
            type: 'ember-deploy-addon',
            adapters: {
              index: {
                "a": MockAdapterA
              },
              assets: {
                "b": MockAdapterB
              }
            }
          }
        ]
      };

      var adapterRegistry = new AdapterRegistry({
        project: project,
        adapters: bundledAdapters
      });

      expect(adapterRegistry.adapters.index).to.have.keys(['redis', 'a']);
      expect(adapterRegistry.adapters.assets).to.have.keys(['s3', 'b']);
    });

    it('does not break when addons bundle no adapters', function() {
      var project = {
        addons: [
          { type: 'ember-deploy-addon' }
        ]
      };

      var adapterRegistry = new AdapterRegistry({
        project: project,
        adapters: bundledAdapters
      });

      expect(adapterRegistry.adapters).to.exist;
    });
  });
});
