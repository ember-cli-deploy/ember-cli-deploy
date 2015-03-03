var DeprecatedCommand = require('./deprecated-command');

module.exports = DeprecatedCommand({
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
