var AssetsUploader = require('../../utilities/assets-uploader');
var DeprecatedCommand = require('./deprecated-command');

module.exports = DeprecatedCommand({
  name: 'deploy:assets',
  description: 'Deploys assets to an asset-host (default: aws:s3)',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development', aliases: ['e',{'dev' : 'development'}, {'prod' : 'production'}] },
    { name: 'deploy-config-file', type: String, default: 'config/deploy.js' }
  ],

  run: function(commandOptions, rawArgs) {
    var AssetsTask = require('../../tasks/assets');
    var assetsTask = new AssetsTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project,
      AssetsUploader: AssetsUploader
    });

    return assetsTask.run(commandOptions);
  }
});
