var chalk = require('chalk');
var green  = chalk.green;

module.exports = {
  description: 'Generate config for ember-cli deployments',
  normalizeEntityName: function() {
    // this prevents an error when the entityName is
    // not specified (since that doesn't actually matter
    // to us
  },
  afterInstall: function(options) {
    this.ui.write(green('ember-cli-deploy needs plugins to actually do the deployment work.\nSee http://ember-cli-deploy.github.io/ember-cli-deploy/docs/v0.5.x/quick-start/\nto learn how to install plugins and see what plugins are available.\n'));
  }
};
