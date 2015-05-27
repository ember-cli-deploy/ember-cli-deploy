var CoreObject = require('core-object');
var AssetsTask = require('../../../lib/tasks/assets');
var MockUI     = require('ember-cli/tests/helpers/mock-ui');
var expect     = require('chai').expect;
var Promise             = require('ember-cli/lib/ext/promise');
var path       = require('path');
var mkdirp     = require('mkdirp');
var fs         = require('fs');
var rimraf     = Promise.denodeify(require('rimraf'));
var existsSync = path.existsSync || fs.existsSync; //renaned in node 0.12

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
  describe('#deleteExcluded', function () {
    it('deletes files matching exclude globs from specified dir', function() {
      var task = new AssetsTask({
        ui: ui,
        AssetsUploader: MockAssetsUploader,
        project: project
      });
      var mockConfig = {
        get: function(key){
          if (key === 'assets.exclude') {
            return [".DS_Store", "foo-*"];
          }
        }
      };
      var root = process.cwd();
      var dir = path.join(root, 'tmp-delete-excluded-test');
      var subdir = path.join(dir, 'subdir');
      mkdirp.sync(dir);
      mkdirp.sync(subdir);
      ['keep.me', '.DS_Store', 'foo-bar.js'].forEach(function(fileName){
        fs.closeSync(fs.openSync(path.join(dir, fileName), 'w'));
        fs.closeSync(fs.openSync(path.join(subdir, fileName), 'w'));
      });
      return task.deleteExcluded(dir, mockConfig).then(function(){
        expect(existsSync(path.join(dir, 'keep.me'))).to.equal(true);
        expect(existsSync(path.join(subdir, 'keep.me'))).to.equal(true);
        expect(existsSync(path.join(dir, '.DS_Store'))).to.equal(false);
        expect(existsSync(path.join(subdir, '.DS_Store'))).to.equal(false);
        expect(existsSync(path.join(dir, 'foo-bar.js'))).to.equal(false);
        expect(existsSync(path.join(subdir, 'foo-bar.js'))).to.equal(false);
      }).finally(function(){
        return rimraf(dir);
      });
    });
  });
});
