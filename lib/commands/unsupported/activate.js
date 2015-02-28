var UnsupportedCommand = require('./unsupported-command');

module.exports = UnsupportedCommand({
  name: 'activate',
  description: 'Activate a deployed version of index.html',
  works: 'insideProject',

  anonymousOptions: [
    '<key>'
  ],

  availableOptions: [
    { name: 'environment', type: String, default: 'development' }
  ]
});
