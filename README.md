# ember-cli-deploy [![Build Status](https://travis-ci.org/ember-cli/ember-cli-deploy.svg?branch=master)](https://travis-ci.org/ember-cli/ember-cli-deploy) [![Code Climate](https://codeclimate.com/github/ember-cli/ember-cli-deploy/badges/gpa.svg)](https://codeclimate.com/github/ember-cli/ember-cli-deploy)

> A deployment pipeline for Ember CLI apps.

This project provides a plugin based pipeline for easy deployment of Ember CLI based applications. By registering an ember-cli-deploy compatible plugin, users can hook in to the pipeline at specific points to control things such as, but not limited to, builds, uploading of assets and post deployment notifications.

## Installation

Simply run:

```
ember install:addon ember-cli-deploy
```

## Configuration

Configuration is supplied to ember-cli-deploy via a configuration file.  By default, this file should be called `deploy.js` and should be located in the `config` directory in the root of your Ember CLI project.

Alternatively, you can specify a different file location by passing the `deploy-config-file` option to the `ember deploy` command.

An example of the configuration file is as follows:

```javascript
// config/deploy.js
module.exports = {
}
```

## Commands

ember-cli-deploy adds the following deployment commands to Ember CLI:

- `ember deploy` Initiates the deployment pipeline, invoking any registered ember-cli-deploy plugins at the defined hook points

## Deployment lifecycle

ember-cli-deploy sees deployment as a pipeline of steps that ultimately result in an application being deployed at some destination. It provides hooks into the common steps found in the deployment lifecycle of an Ember CLI application, allowing plugins to modify what happens at each step in the pipeline.

### Hooks

The hooks that are exposed by by ember-cli-deploy are as follows:

- willDeploy
- build
- update
- activate
- didDeploy

## Plugins

Plugins are the pieces that actually make the deployment happen.  A plugin can define one or more of the above hooks which will then be run at the relevant point in the deployment pipeline.

### Plugin architecture

Plugins are npm packages that hook into the deployment pipeline and actually perform tasks.  An example of an ember-cli-deploy plugin might be a plugin that builds the project, uploads the index.html to redis or uploads assets to S3.

In order for an npm package to be registered as an ember-cli-deploy plugin, it must be an [Ember CLI addon](http://www.ember-cli.com/#developing-addons-and-blueprints) and must specify the `ember-ci-deploy-plugin` keyword in it's `package.json` like so:

```javascript
// package.json

"keywords": [
  "ember-addon",
  "ember-cli-deploy-plugin"
]
```

Finally the plugin must implement at least one of the above hooks.  The ember-cli-deploy pipeline will invoke any implemented hooks at the relevant point in the pipeline.

Hooks must be self sufficient and not rely on any effects from other hooks. Each implemented hooks must also return a `Promise` which resolves or rejects depending on whether it ran successfully or not.

The promise returned from a plugin hook should either:

- resolve with `undefined`;
- reject with an `Error` instance if the error is unhandled or;
- reject with `undefined` if it was handled.

An ember-cli-deploy plugin should look something like this:

```javascript
// plugins/lightening-fast-deployment.js

var Plugin = require('ember-cli-deploy/models/plugin');

module.exports = Plugin.extend({
  build: function() {
    return someBuildTask.run();
  },
  
  update: function() {
    return assetUploader.run()
      .then(indexUploader.run.bind(this));
  },
  
  didDeploy: function() {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      this.ui.write('You did it!');
      resolve();
    });
  }
});
```

### Default plugins

[TBC]
