var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var redis          = require('then-redis');
var RSVP           = require('rsvp');
var RedisAdapter   = require('../../../../utilities/index/redis');

chai.use(chaiAsPromised);
var expect = chai.expect;

var MANIFEST                 = 'ember-deploy';
var REVISION_KEY             = 'test';
var DOCUMENT_TO_SAVE         = 'Hello';
var UPLOAD_KEY               = MANIFEST+':'+REVISION_KEY;
var MANIFEST_SIZE            = 10;
var REDIS_CONNECTION_OPTIONS = {
  host: 'localhost',
  port: 6379
};

var redisClient = redis.createClient(REDIS_CONNECTION_OPTIONS);

var redisAdapter;
var upload;

var delAllKeys = function(keys) {
  var promises = keys.map(function(key) {
    return redisClient.del(key);
  });

  return RSVP.all(promises);
};

var delKeysByWildcard = function(wildcard) {
  return new RSVP.Promise(function(resolve, reject) {
    redisClient.keys(wildcard)
      .then(delAllKeys)
      .then(resolve,reject);
  });
};

var cleanUpRedis = function(done) {
  return redisClient.del(MANIFEST)
    .then(delKeysByWildcard.bind(null, MANIFEST+':*'))
    .then(done.bind(null, null));
};

var uploadWithRevisionKey = function(key) {
  return redisAdapter.upload(DOCUMENT_TO_SAVE, key);
};

var fillUpManifest = function(uploadCount, revisionsList) {
  var promises = [];

  for (var i = 0; i < uploadCount; i++) {
    var newRevisionKey = REVISION_KEY.replace(REVISION_KEY.charAt(0), i);
    var newUploadKey   = MANIFEST+':'+newRevisionKey;

    promises.push(uploadWithRevisionKey(newUploadKey));
    if (Array.isArray(revisionsList)) { revisionsList.push(newUploadKey); }
  }

  return RSVP.all(promises)
};

describe('RedisAdapter', function() {
  beforeEach(function() {
    redisAdapter = new RedisAdapter({
      config: REDIS_CONNECTION_OPTIONS,
      manifest: MANIFEST,
      manifestSize: MANIFEST_SIZE
    });

    upload = uploadWithRevisionKey(UPLOAD_KEY);
  });

  afterEach(function(done) {
    cleanUpRedis(done);
  });

  describe('#upload', function() {
    it('stores passed value in redis', function() {
      return upload
        .then(function() {
          return redisClient.get(UPLOAD_KEY);
        })
        .then(function(result) {
          return expect(result).to.eq(DOCUMENT_TO_SAVE);
        });
    });

    it('resolves with the document key on successful upload', function() {
      return expect(upload).to.become(UPLOAD_KEY);
    });

    it('rejects when passed key is already in manifest', function() {
      return upload
        .then(function() {
          var second = redisAdapter.upload(DOCUMENT_TO_SAVE, UPLOAD_KEY);
          return expect(second).to.be.rejected;
        });
    });

    it('updates a list of recent uploads when upload resolves', function() {
      return upload
        .then(function() {
          return redisClient.lrange(MANIFEST, 0, MANIFEST_SIZE);
        })
        .then(function(values) {
          return expect(values.length).to.be.greaterThan(0);
        });
    });

    it('only keeps <manifestSize> uploads in list after upload', function() {
      return upload
        .then(fillUpManifest.bind(null, MANIFEST_SIZE))
        .then(function() {
          return redisClient.lrange(MANIFEST, 0, 20);
        })
        .then(function(values) {
          return expect(values.length).to.eq(MANIFEST_SIZE);
        });
    });
  });

  describe('list/activate', function() {
    var uploadsDone;
    var revisionsList;

    beforeEach(function() {
      revisionsList = [];
      uploadsDone = upload
        .then(fillUpManifest.bind(null, MANIFEST_SIZE, revisionsList));
    });

    describe('#list', function() {
      it('lists all uploads stored in manifest', function() {
        return uploadsDone
          .then(function() {
            return redisAdapter.list();
          })
          .then(function(uploads) {
            return revisionsList.forEach(function(upload) {
              expect(uploads).to.contain(upload);
            });
          });
          ;
      });
    });

    describe('#activate', function() {
      it('sets <manifest>:current when key is included in manifest', function() {
        var revisionToActivate;

        return uploadsDone
          .then(function() {
            revisionToActivate = revisionsList[0];
            return redisAdapter.activate(revisionToActivate);
          })
          .then(function() {
            return redisClient.get(MANIFEST+':current');
          })
          .then(function(result) {
            return expect(result).to.eq(revisionToActivate);
          });
      });

      it('rejects when key is not included in manifest', function() {
        var activation = uploadsDone
          .then(function() {
            return redisAdapter.activate('not-in-manifest');
          });

        return expect(activation).to.be.rejected;
      });
    });
  });
});
