module.exports = {
  name: 'deploy',
  description: 'Deploys an ember-cli app',
  works: 'insideProject',

  availableOptions: [
    { name: 'environment', type: String, default: 'development' }
  ],

  run: function(commandOptions, rawArgs) {
    var DeployIndexTask = require('../tasks/deploy-index');
    var AssetsTask      = require('../tasks/assets');
    var BuildTask       = this.tasks.Build;

    var buildTask = new BuildTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project

    });
    var buildOptions = {
      environment: "production",
      outputPath: "dist/",
      watch: false,
      disableAnalytics: false
    };
    var assetsTask = new AssetsTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });
    var deployIndexTask = new DeployIndexTask({
      ui: this.ui,
      analytics: this.analytics,
      project: this.project
    });

    return buildTask.run(buildOptions)
      .then(function() {
        return assetsTask.run(commandOptions);
      })
      .then(function() {
        return deployIndexTask.run(commandOptions);
      });
  }
};
