var DeprecatedCommand = require('./deprecated-command');

module.exports = DeprecatedCommand({
  name: 'deploy:versions',
  description: 'Lists all versions of the app have been deployed',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' }
  ]
});
