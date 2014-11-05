var S3Adapter      = require('../../../utilities/assets/s3');
var UnknownAdapter = require('../../../utilities/assets/unknown');
var AssetsUploader = require('../../../utilities/assets-uploader');
var expect         = require('chai').expect;

describe('AssetsUploader', function() {
  it('uses the s3-adapter as default adapter', function() {
    var uploader = new AssetsUploader();

    expect(uploader.adapter.constructor).to.eq(S3Adapter);
  });

  it('uses the UnknownAdapter when an unknown adapter is passed', function() {
    var uploader = new AssetsUploader({
      type: 'trolololol'
    });

    expect(uploader.adapter.constructor).to.eq(UnknownAdapter);
  });
});
