var UnknownAdapter = require('../../../lib/utilities/assets/unknown');
var AssetsUploader = require('../../../lib/utilities/assets-uploader');
var expect         = require('chai').expect;

describe('AssetsUploader', function() {
  it('uses the UnknownAdapter when an unknown adapter is passed', function() {
    var uploader = new AssetsUploader({
      type: 'trolololol'
    });

    expect(uploader.adapter.constructor).to.eq(UnknownAdapter);
  });
});
