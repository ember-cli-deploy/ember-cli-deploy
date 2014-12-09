var expect            = require('chai').expect;
var git               = require('gitty');
var sinon             = require('sinon');
var ShaTaggingAdapter = require('../../../../utilities/tagging/sha');

var getShortShaVersion = function(sha) {
  return sha.slice(0,7);
};

var GIT_SHA           = '04b724a6c656a21795067f9c344d22532cf593ae';
var GIT_SHA_SHORTENED = getShortShaVersion(GIT_SHA);

describe('ShaTaggingAdapter', function() {
  var sandbox;

  beforeEach(function() {
    sandbox = sinon.sandbox.create();
    sandbox
      .stub(git.Command.prototype, 'exec')
      .yields('error', GIT_SHA, 'stderr');
  });

  afterEach(function() {
    sandbox.restore();
  });

  describe('#createTag', function() {
    it('returns a tag based on current git-sha and manifestName', function() {
      var manifestName   = 'ember-deploy';
      var expectedTag    = manifestName+':'+GIT_SHA_SHORTENED;
      var revisionTagger = new ShaTaggingAdapter({
        manifest: manifestName
      });

      expect(revisionTagger.createTag()).to.eq(expectedTag);
    });
  });
});
