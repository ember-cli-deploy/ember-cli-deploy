var DeprecatedCommand = require('./deprecated-command');
var ListCommand = require('../list');

module.exports = DeprecatedCommand({
  name: 'deploy:versions',
  description: 'Lists all versions of the app have been deployed',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  run: ListCommand.run
});
