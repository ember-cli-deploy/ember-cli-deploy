var CoreObject     = require('core-object');
var chai           = require('chai');
var chaiAsPromised = require('chai-as-promised');
var MockUI         = require('ember-cli/tests/helpers/mock-ui');
var SilentError    = require('ember-cli/lib/errors/silent');
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
var revisionsList = [];
var mockShaTaggingAdapter = new CoreObject({
  tagCount: 0,

  mockTag: UPLOAD_KEY,

  createTag: function() {
    var tag = this.tagCount < 1 ? this.mockTag : this.mockTag+this.tagCount;
    revisionsList.push(tag);
    this.tagCount++;
    return tag;
  },

  reset: function() {
    this.tagCount = 0;
  }
});

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

var uploadWithRevisionKey = function() {
  return redisAdapter.upload(DOCUMENT_TO_SAVE);
};

var fillUpManifest = function(uploadCount, revisionsList) {
  var promises = [];

  for (var i = 0; i < uploadCount; i++) {
    promises.push(uploadWithRevisionKey());
  }

  return RSVP.all(promises);
};

var resetUI = function(adapter) {
  adapter.ui.output = '';
};

describe('RedisAdapter', function() {
  beforeEach(function() {
    redisAdapter = new RedisAdapter({
      config: REDIS_CONNECTION_OPTIONS,
      manifest: MANIFEST,
      manifestSize: MANIFEST_SIZE,
      taggingAdapter: mockShaTaggingAdapter,
      ui: new MockUI()
    });

    upload = uploadWithRevisionKey();
  });

  afterEach(function(done) {
    mockShaTaggingAdapter.reset();
    revisionsList = [];
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

    it('prints a success message when upload succeeds', function() {
      return upload
        .then(function() {
          var output = redisAdapter.ui.output;
          return expect(output).to.contain('Upload successful');
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

    describe('upload failure', function() {
      var second;

      beforeEach(function() {
        second = upload
          .then(function() {
            mockShaTaggingAdapter.reset();

            return redisAdapter.upload(DOCUMENT_TO_SAVE);
          });
      });

      it('rejects when passed key is already in manifest', function() {
        return expect(second).to.be.rejected;
      });

      it('rejects with a SilentError ember-cli can handle', function() {
        var errorMessage = /Upload\ failed!/;
        return expect(second).to.be.rejectedWith(SilentError, errorMessage);
      });
    });
  });

  describe('list/activate', function() {
    var uploadsDone;

    beforeEach(function() {
      uploadsDone = upload
        .then(fillUpManifest.bind(null, MANIFEST_SIZE - 1, revisionsList));
    });

    describe('#list', function() {
      it('lists all uploads stored in manifest', function() {
        return uploadsDone
          .then(function() {
            resetUI(redisAdapter);
            return redisAdapter.list();
          })
          .then(function() {
            var uploads = redisAdapter.ui.output;
            return revisionsList.forEach(function(upload) {
              expect(uploads).to.contain(upload);
            });
          });
      });

      it('prints out a formatted list of uploaded revisions', function() {
        return uploadsDone
          .then(function() {
            resetUI(redisAdapter);

            return redisAdapter.list();
          })
          .then(function() {
            var list = 'uploaded revisions';
            return expect(redisAdapter.ui.output).to.contain(list);
          });
      });
    });

    describe('#activate', function() {
      var activation;

      describe('successfull activation', function() {
        var revisionToActivate;

        beforeEach(function() {
          activation = uploadsDone
            .then(function() {
              resetUI(redisAdapter);
              revisionToActivate = revisionsList[0];
              return redisAdapter.activate(revisionToActivate);
            });
        });

        it('sets <manifest>:current when key is in manifest', function() {
          return activation
            .then(function() {
              return redisClient.get(MANIFEST+':current');
            })
            .then(function(result) {
              return expect(result).to.eq(revisionToActivate);
            });
        });

        it('prints a success message when activation succeeds', function() {
          return activation
            .then(function() {
              var successMessage = 'Activation successful!';
              return expect(redisAdapter.ui.output).to.contain(successMessage);
            });
        });
      });

      it('rejects when no revision is passed', function() {
        activation = uploadsDone
          .then(function() {
            return redisAdapter.activate();
          });

        return expect(activation).to.be.rejectedWith(SilentError, /Error!/);
      });

      it('rejects with SilentError when key is not in manifest', function() {
        activation = uploadsDone
          .then(function() {
            return redisAdapter.activate('not-in-manifest');
          });

        return expect(activation).to.be.rejectedWith(SilentError, /Error!/);
      });
    });

    describe('#current', function() {
      it('returns revision that set <manifest>:current', function() {
        return uploadsDone
          .then(function() {
            revisionToActivate = revisionsList[0];
            return redisAdapter.activate(revisionToActivate);
          })
          .then(function() {
            return redisAdapter._current();
          })
          .then(function(result) {
            return expect(result).to.eq(revisionToActivate);
          });
      });
    });
  });
});
