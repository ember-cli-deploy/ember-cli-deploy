var DeployTask          = require('../utilities/deploy-task');

module.exports = DeployTask.extend({
  run: function() {
    return this.executeDeploymentHook('discoverVersions');
  }
});
