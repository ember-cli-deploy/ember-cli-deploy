var CoreObject = require('core-object');
var AssetsTask = require('../../../lib/tasks/assets');
var MockUI     = require('ember-cli/tests/helpers/mock-ui');
var expect     = require('chai').expect;
var path       = require('path');

describe('AssetsTask', function() {
  var ui, project, MockAssetsUploader, mockAssetsUploaderConfig;

  beforeEach(function() {
    mockAssetsUploaderConfig = null;
    ui = new MockUI();
    project = { name: function(){ return 'foo'; }}
    MockAssetsUploader = CoreObject.extend({
      init: function() {
        mockAssetsUploaderConfig = this.config;
      },
      upload: function(){}
    })
  });
  describe('#uploadAssets', function(){
    it('receives a POJO config object (which is a bad idea and we should change this API)', function() {
      var root = process.cwd();
      var task = new AssetsTask({
        ui: ui,
        AssetsUploader: MockAssetsUploader,
        project: project
      });
      var configFile = require(path.join(root, './config/deploy.js'));
      task.uploadAssets('development', 'config/deploy.js');
      expect(mockAssetsUploaderConfig.assets).to.be.exist;
      expect(mockAssetsUploaderConfig.assets.bucket).to.equal('<your-bucket-name>');
      expect(mockAssetsUploaderConfig.assets.type).to.equal('s3');
    });
  });
});
