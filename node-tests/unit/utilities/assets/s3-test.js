var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var MockS3         = require('../../../helpers/mock-s3');
var MockUI         = require('ember-cli/tests/helpers/mock-ui');
var S3Adapter      = require('../../../../utilities/assets/s3');
var chalk          = require('chalk');

chai.use(chaiAsPromised);

var s3Adapter;
var expect = chai.expect;

var getLastUILine = function(output) {
  var uiOutputByLine = output.split('\n');
  return uiOutputByLine[uiOutputByLine.length - 2];
};

var stubConfig = {
  "assets": {
    "accessKeyId": "<your-access-key-goes-here>",
    "secretAccessKey": "<your-secret-access-key-goes-here>",
    "bucket": "<your-bucket-name>"
  }
};
var stubConfigWithPrefix = {
  "assets": {
    "accessKeyId": "<your-access-key-goes-here>",
    "secretAccessKey": "<your-secret-access-key-goes-here>",
    "bucket": "<your-bucket-name>",
    "prefix": "release/"
  }
};

describe('S3Adapter', function() {
  beforeEach(function() {
    s3Adapter = new S3Adapter({
      ui: new MockUI(),
      s3: new MockS3(),
      config: stubConfig
    });
  });

  it('rejects if no ui is passed on initialization', function() {
    s3Adapter = new S3Adapter({
      s3: new MockS3(),
      config: stubConfig
    });
    expect(s3Adapter.upload()).to.be.rejected;
  });

  describe('#upload', function() {
    it("passes the correct params to s3's uploadDir-method", function() {
      var expected = {
        localDir: 'tmp/assets-sync',
        s3Params: {
          Bucket: '<your-bucket-name>',
          Prefix: 'assets/',
          ContentEncoding: 'gzip',
          CacheControl: 'max-age=63072000, public',
          Expires: new Date('2030')
        }
      };

      s3Adapter.upload();

      expect(s3Adapter.client.uploadParams).to.eql(expected);
    });
    it("allows the prefix to be customized", function() {
      var s3AdapterCustomPrefix = new S3Adapter({
        ui: new MockUI(),
        s3: new MockS3(),
        config: stubConfigWithPrefix
      });

      var expected = {
        localDir: 'tmp/assets-sync',
        s3Params: {
          Bucket: '<your-bucket-name>',
          Prefix: 'release/',
          ContentEncoding: 'gzip',
          CacheControl: 'max-age=63072000, public',
          Expires: new Date('2030')
        }
      };

      s3AdapterCustomPrefix.upload();

      expect(s3AdapterCustomPrefix.client.uploadParams).to.eql(expected);
    });
    it('rejects when the upload encounters an error', function() {
      var promise = s3Adapter.upload();
      s3Adapter.s3.eventEmitter.emit('error', { stack: 'test error stack' });
      expect(promise).to.be.rejected;
    });

    it('resolves when the upload ends', function() {
      var promise = s3Adapter.upload();
      s3Adapter.s3.eventEmitter.emit('end');
      expect(promise).to.be.resolved;
    });

    it('prints the fingerprinted filename for every fileUpload', function() {
      var fullPath = 'some-path/on-filesystem/filename-f1n63rpr1n7.js';
      var fullKey  = 'does-not-matter-we-dont-use-it';
      var expected = 'Uploading: filename-f1n63rpr1n7.js';

      s3Adapter.upload();
      s3Adapter.s3.eventEmitter.emit('fileUploadStart', fullPath, fullKey);

      var lastLine = getLastUILine(s3Adapter.ui.output);
      expect(chalk.stripColor(lastLine)).to.eq(expected);
    });

    it('also prints the name of non-fingerprinted files', function() {
      var fullPath = 'some-path/on-filesystem/filename.js';
      var fullKey  = 'does-not-matter-we-dont-use-it';
      var expected = 'Uploading: filename.js';

      s3Adapter.upload();
      s3Adapter.s3.eventEmitter.emit('fileUploadStart', fullPath, fullKey);

      var lastLine = getLastUILine(s3Adapter.ui.output);
      expect(chalk.stripColor(lastLine)).to.eq(expected);
    });
  });
});
