---
title: Writing a plugin
---

So, you want to write a plugin? Great! It's people like you that will help the ember-cli-deploy plugin ecosystem flourish.

So, let's get started.

## The anatomy of a plugin

ember-cli-deploy plugins are nothing more than standard ember-cli addons with 3 small ember-cli-deploy specific traits:

1. they contain a `package.json` keyword to identify them as plugins
2. they are named `ember-cli-deploy-*`
3. they return an object that implements one or more of the ember-cli-deploy [pipeline hooks](../pipeline-hooks)

Let's have a look at each of these things in a bit more detail.

### Create an addon

An ember-cli-deploy plugin is just a standard ember-cli addon. Create it as follows:

```bash
ember addon ember-cli-deploy-funky-plugin
```

**NB**: Make sure it is named `ember-cli-deploy-<something>`

### Identify the addon as a plugin

In order for ember-cli-deploy to know your addon is a plugin, we need to identify it as such by updating the `package.json` like so:

```javascript
// package.json

"keywords": [
  "ember-addon",
  "ember-cli-deploy-plugin"
]
```

### Implement one or more pipeline hooks

In order for a plugin to be useful it must implement one or more of the ember-cli-deploy [pipeline hooks](../pipeline-hooks).

To do this you must implement a function called `createDeployPlugin` in your `index.js` file. This function must return an object that contains:

1. a `name` property which is what your plugin will be referred to by in the `config/deploy.js` and;
2. one or more implemented pipeline hooks

Let's look at an example:

```javascript
module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    return {
      name: options.name,

      didBuild: function(context) {
        //do something amazing here once the project has been built
      },

      upload: function(context) {
        //do something here to actually deploy your app somewhere
      },

      didDeploy: function(context) {
        //do something here like notify your team on slack
      }
    };
  }
};
```

That's seriously about as difficult as it gets. However, read on for some more advanced info to get the most out of your ember-cli-deploy plugin.

## The Base Deploy Plugin

There are some common tasks that the majority of plugins need to do like validate configuration and log messages out to the terminal. So we have created
a [base plugin](https://github.com/ember-cli-deploy/ember-cli-deploy-plugin) that you can extend to get this functionality for free.

### Extending the base plugin

To extend the base plugin, first you need to install it:

```bash
ember install ember-cli-deploy-plugin
```

Then you need to extend it like this:

```javascript
var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      didBuild: function(context) {
        //do something amazing here once the project has been built
      },

      upload: function(context) {
        //do something here to actually deploy your app somewhere
      },

      didDeploy: function(context) {
        //do something here like notify your team on slack
      }
    });

    return new DeployPlugin();
  }
};
```

### Validating plugin config

ember-cli-deploy provides a pipeline hook called `configure` for the purpose of validating and setting up state that will be needed by the plugin hooks executed later on in the pipeline.
This hook is the perfect place to validate that the plugin has all the required config it needs to perform it's pipeline tasks.

As this validation is such a common thing, the base deploy plugin will implement the `configure` hook by default and validate the configuration for you. In order for this to happen, you must
implement one or both of `defaultConfig` and `requiredConfig`.

#### defaultConfig

The `defaultConfig` property allows you to specify default values for config properties that are not defined in `config/deploy.js`, like this:

```javascript
var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        filePattern: '**/*.{js,css,png}' // default filePattern if it isn't defined in config/dpeloy.js
      },

      upload: function(context) { }
    });

    return new DeployPlugin();
  }
};
```

You can also have the defaultConfig options be a function that takes in the [deployment context](../deployment-context) as the first argument. This allows the config value to be decided at runtime based
on properties that have been added to the deployment context by other plugins that have run before it.

```javascript
var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        gzippedFiles: function(context) {
          return context.gzippedFiles || []; // if gzippedFiles has been added to the context by another plugin we can use it
        }
      },

      upload: function(context) { }
    });

    return new DeployPlugin();
  }
};
```

#### requiredConfig

The `requiredConfig` property allows you to specify config properties that must be provided in order for the plugin to function correctly in the deployment pipeline.
If any required config value is not provided the pipeline will be aborted and an error message will be displayed informing you of which config property is missing.

You can specify the required configuration properties like this:

```javascript
var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      requiredConfig: ['accessKeyId', 'secretAccessKey'],

      upload: function(context) { }
    });

    return new DeployPlugin();
  }
};
```

### Logging messages to the terminal

Due to the custom pipeline output that ember-cli-deploy displays, the base plugin provides a function to log messages into the pipeline output.

To log a message to the terminal use the `log` function as follows:

```javascript
var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      upload: function(context) {
        this.log('Uploading assets');
      }
    });

    return new DeployPlugin();
  }
};
```

If you need to log an error or warning message using a different color, simply pass the color in as an option to the `log` function like this:

```javascript
var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      upload: function(context) {
        this.log('Oops. Something went wrong', { color: 'red' });
      }
    });

    return new DeployPlugin();
  }
};
```

### Accessing config properties

When you want to access config properties from inside your pipeline hooks, the base plugin provides the `readConfig` function to do so. It is this function that allows
you to have config values that are calculated at run time based on data in the [deployment context](../deployment-context).

A basic example of using this function is with a static config value, like so:

```javascript
var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        manifestPath: '/manifest.txt'
      },

      upload: function(context) { }
        this.readConfig('manifestPath') // will return the static value of '/manifest.txt'
    });

    return new DeployPlugin();
  }
};
```

However, it gets much more interesting when the config value is a function:

```javascript
var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      defaultConfig: {
        manifestPath: function(context) {
          return context.manifestPath;
        }
      },

      upload: function(context) { }
        this.readConfig('manifestPath') // will return the value of manifestPath, that has been added to the context by another plugin, at runtime
    });

    return new DeployPlugin();
  }
};
```

In this example, it is assumed that some other plugin hook that has been run previously to this `upload` hook has added the `manifestPath` property to the deployment context.
At the point that `readConfig` is called, the config function is exectuted passing in the current deployment context, returning the current value of `manifestPath`.

### Adding data to the deployment context object

The [deployment context](../deployment-context) is an object that is passed to each pipeline hook as it is executed. It allows plugins to access data from plugin hooks that have run before it  and to
pass data to plugin hooks that will run after it.

To add something to the deployment context, simply return an object from your pipeline hook. This object will be merged into the current deployment context which will then be passed to every pipeline hook thereafter.

So, imagine the deployment context looks like this:

```javascript
{ distFiles: ['index.html', 'assets/app.js' ] }
```

When you return an object from your pipeline hook like this:

```javascript
var BasePlugin = require('ember-cli-deploy-plugin');

module.exports = {
  name: 'ember-cli-deploy-funky-plugin',

  createDeployPlugin: function(options) {
    var DeployPlugin = BasePlugin.extend({
      name: options.name,

      upload: function(context) { }
        return {
          uploadedAt: '2015-10-14T22:29:46.313Z'
        };
    });

    return new DeployPlugin();
  }
};
```

Then once the pipeline hook has run, the deployment context will look like this:

```javascript
{ distFiles: ['index.html', 'assets/app.js' ], uploadedAt: '2015-10-14T22:29:46.313Z' }
```

And every pipeline hook run thereafter will be able to access the `uploadedAt` property.
