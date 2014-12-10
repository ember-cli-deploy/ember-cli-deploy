var Adapter     = require('../adapter');
var RSVP        = require('rsvp');
var redis       = require('then-redis');
var chalk       = require('chalk');
var Promise     = require('ember-cli/lib/ext/promise');
var SilentError = require('ember-cli/lib/errors/silent');

var DEFAULT_MANIFEST_SIZE   = 10;
var DEFAULT_TAGGING_ADAPTER = 'sha';

var green = chalk.green;
var white = chalk.white;

module.exports = Adapter.extend({
  init: function() {
    this.tagging      = this.tagging || DEFAULT_TAGGING_ADAPTER;
    this.manifestSize = this.manifestSize || DEFAULT_MANIFEST_SIZE;
    this.client       = redis.createClient(this.config);
  },

  upload: function(value) {
    var taggingAdapter = this.taggingAdapter || this._initTaggingAdapter();
    var key            = taggingAdapter.createTag();

    return this._upload(value, key);
  },

  list: function() {
    return RSVP.hash({
      revisions: this._list(),
      current: this._current()
    })
    .then(function(results) {
      var revisions = results.revisions;
      var current = results.current;

      message = this._revisionListMessage(revisions, current);
      this._printSuccessMessage(message);
      return message;
    }.bind(this));
  },

  activate: function(revisionKey) {
    if (!revisionKey) {
      return this._printErrorMessage(this._noRevisionPassedMessage());
    };

    var uploadKey = this._currentKey();
    var that      = this;

    return new RSVP.Promise(function(resolve, reject) {
      that.list()
        .then(function(uploads) {
          return uploads.indexOf(revisionKey) > -1 ? resolve() : reject();
        })
        .then(function() {
          return that.client.set(uploadKey, revisionKey);
        })
        .then(resolve);
    })
    .then(this._activationSuccessfulMessage)
    .then(this._printSuccessMessage.bind(this))
    .catch(function() {
      return this._printErrorMessage(this._revisionNotFoundMessage());
    }.bind(this));
  },

  _list: function() {
    return this.client.lrange(this.manifest, 0, this.manifestSize - 1)
  },

  _current: function() {
    return this.client.get(this._currentKey());
  },

  _initTaggingAdapter: function() {
    var TaggingAdapter = require('../tagging/'+this.tagging);

    return new TaggingAdapter({
      manifest: this.manifest
    });
  },

  _upload: function(value, key) {
    return this._uploadIfNotAlreadyInManifest(value, key)
      .then(this._updateManifest.bind(this, this.manifest, key))
      .then(this._cleanUpManifest.bind(this))
      .then(this._deploySuccessMessage.bind(this, key))
      .then(this._printSuccessMessage.bind(this))
      .then(function() { return key; })
      .catch(function() {
        var message = this._deployErrorMessage();
        return this._printErrorMessage(message);
      }.bind(this));
  },

  _uploadIfNotAlreadyInManifest: function(value, key) {
    var that = this;

    return new RSVP.Promise(function(resolve, reject) {
      that.client.get(key)
        .then(function(result) {
          result === null ? resolve() : reject();
        })
        .then(function() {
          return that.client.set(key, value);
        })
        .then(resolve);
    });
  },

  _updateManifest: function(manifest, key) {
    return this.client.lpush(manifest, key);
  },

  _cleanUpManifest: function() {
    return this.client.ltrim(this.manifest, 0, this.manifestSize - 1);
  },

  _currentKey: function() {
    return this.manifest+':current';
  },

  _printSuccessMessage: function(message) {
    return this.ui.writeLine(message);
  },

  _printErrorMessage: function(message) {
    return Promise.reject(new SilentError(message));
  },

  _deploySuccessMessage: function(revisionKey) {
    var success       = green('\nUpload successful!\n\n');
    var uploadMessage = white('Uploaded revision: ')+green(revisionKey);

    return success + uploadMessage;
  },

  _deployErrorMessage: function() {
    var failure    = '\nUpload failed!\n';
    var suggestion = 'Did you try to upload an already uploaded revision?\n\n';
    var solution   = 'Please run `'+green('ember deploy:list')+'` to ' +
                     'investigate.';

    return failure + '\n' + white(suggestion) + white(solution);
  },

  _noRevisionPassedMessage: function() {
    var err = '\nError! Please pass a revision to `deploy:activate`.\n\n';

    return err + white(this._revisionSuggestion());
  },

  _activationSuccessfulMessage: function() {
    var success = green('\nActivation successful!\n\n');
    var message = white('Please run `'+green('ember deploy:list')+'` to see '+
                        'what revision is current.');

    return success + message;
  },

  _revisionNotFoundMessage: function() {
    var err = '\nError! Passed revision could not be found in manifest!\n\n';

    return err + white(this._revisionSuggestion());
  },

  _revisionSuggestion: function() {
    var suggestion = 'Try to run `'+green('ember deploy:list')+'` '+
                     'and pass a revision listed there to `' +
                     green('ember deploy:activate')+'`.\n\nExample: \n\n'+
                     'ember deploy:activate --revision <manifest>:<sha>';

    return suggestion;
  },

  _revisionListMessage: function(revisions, currentRevision) {
    var manifestSize = this.manifestSize;
    var headline      = '\nLast '+ manifestSize + ' uploaded revisions:\n\n';
    var revisionsList = revisions.reduce(function(prev, curr) {
      var prefix = (curr === currentRevision) ? '| => ' : '|    ';
      return prev + prefix + chalk.green(curr) + '\n';
    }, '');
    var footer = '\n\n# => - current revision';

    return headline + revisionsList + footer;
  }
});
