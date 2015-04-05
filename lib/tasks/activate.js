var DeployTask = require('../utilities/deploy-task');

module.exports = DeployTask.extend({
  run: function(options) {
    return this.executeDeploymentHook('activate', options);
  }
});
