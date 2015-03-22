# Plugins for ember-cli-deploy

This document describes the API related to plugins in the next
version of ember-cli-deploy.

### Overview of plugins

A plugin is an ember-cli addon that hooks into the ember-cli-deploy
pipeline in order to add functionality to a deploy. Example addon
functionality would be uploading assets to S3, writing the index.html to
Redis, or notifying a Slack channel a deploy has completed.

In general, OSS plugins should focus on doing a specific task. Most
Ember developers with common deployment targets will compose multiple
plugins to fine tune their deployment process. Developers with very
custom needs might create a single private plugin that implements all
aspects of their deployment process within the structure provided by
ember-cli-deploy.

Because plugins are implemented via addons, they may be included via
node_module dependencies or via in-repo-addons.

### Identifying plugins

Plugins are ember-cli addons. They will also have the keyword
`ember-cli-deploy-plugin`. An example `package.json` for a plugin:

```
{
  "name": "ember-cli-deploy-example-plugin",
  "version": "0.4.0",
  // ...
  "devDependencies": {
    "ember-cli": "0.2.0",
    "ember-cli-deploy": "0.4.1"
    // ...
  },
  "keywords": [
    "ember-addon",
    "ember-cli-deploy-plugin"
  ]
}
```

By default, any plugin that is installed will be loaded, similar to
ember-cli addons. The plugin order is determined by how ember-cli orders
addons (based on `before:`/`after:` properties). To override this, see
Advanced Plugin Configuration and Ordering below.

### Plugins are provided by ember-cli addons

Plugins are ember-cli addons which implement an `createDeployPlugin()` method
to return an object which implements one or more methods that are called by
ember-cli-deploy. For example:

```javascript
module.exports = {
  name: 'ember-cli-deploy-example-plugin',
  createDeployPlugin: function(options){
    return {
      name: options.name,
      willDeploy: function:(deployment){
        // do something during the willDeploy phase of the pipeline
      },
      didDeploy: function:(deployment){
        // do something during the didDeploy phase of the pipeline
      },
      // etc, see hooks section for a complete list of methods that
      // may be implemented by a plugin
    }
  }
}
```

This approach limits the risk of name conflicts at the top-level of the addon.
It also allows for the plugin author to consult the addon instance during
creation of the plugin object to make any contextual decisions necessary.
Finally, it is agnostic with respect to the type of object the plugin is.
It may be a POJO, a subclass of CoreObject, or maybe an ES6 class.

The `options` argument passed to `createDeployPlugin` will have a `name`
property. Usually, the `name` will be the plugin name sans the `ember-cli-deploy-`
prefix, unless a name has been specified as described in Advanced Plugin
Configuration below.

### The `deployment` object

For each high-level ember-cli-deploy operation, a `deployment` object is created.
This object is passed to each hook that is invoked on the plugins. It has a number
of properties that may be of use to a plugin:

Property | file | info
--- | --- | ---
`ui` | - | The ember-cli UI object that can be used to write to stdout.
`appConfig` | `config/environment.js` | The application configuration.
`config` | stored in `config/deploy.js` | The configuration portion of `config/deploy.js` for the active environment
`data` | - | Runtime information about the current operation. Plugins can set properties on this object for later use by themselves or another plugin.

### Async operations in hooks

Hook functions can return a promise to block the deployment pipeline.
Since most deployment involves some sort of IO it makes senses that most
plugins will want an async function to complete before continuing to the
next step. If a plugin does not return a promise, then ember-cli-deploy
proceeds immediately.

If a promise from any of the plugins is rejected then the deployment
pipeline will stop and ember-cli-deploy will exit. Returned promises that are
rejected are treated as unrecoverable errors.

### Configuration

By convention, plugin configuration should be kept in `config/deploy.js` and scoped by
the plugin's name. e.g. for an `ember-cli-deploy-example` plugin, the configuration would
go in:

```javascript
// config/deploy.js
module.exports = {
  production: {
    "example": {
      bucket: "my-app-production",
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
  }
};
```

### Hooks

These hooks (part of a typical deployment process) are available for plugins to implement:

```
willDeploy: --> runs before anything happens. good opportunity for plugins to validate
                configuration or other preconditions

           /-- willBuild    confirm environment
          /
build --------> builds app assets, documentation, etc.
          \
           \-- didBuild     manipulate index.html, validate assets

           /-- willUpload   confirm remote servers(S3, Redis, Azure, etc.)
          /
upload -------> puts the assets somewhere(S3, Redis, Azure, Rackspace, etc.)
          |     Note: a plugin that implements upload of the HTML file and
          |           wants to support version activation should set
          |           `currentVersion` on the `deployment` object to the ID
          |           of the newly deployed version.
          \
           \-- didUpload    notify APIs (slack, pusher, etc.), warm cache

           /-- willActivate   create backup of assets, notify APIs, uninstall earlier versions
          /
activate -------> make a new version live (clear cache, swap Redis values, etc.)
          \
           \-- didActivate    notify APIs, warm cache

  Note: when hooks in the activate series of hooks are called, the plugin can assume the
        presence of a `currentVersion` property on the deployment object, that is set to
        the ID of the version to be activated.

didDeploy: --> runs at the end of a full deployment operation.
```

In addition, there are a few more specialized hooks that plugins may implement:

```
discoverVersions: --> should return a promise resolving to an array of version objects. Each
                      version object _must_ have an `id` property. Each version _may_ have one
                      or more of the following properties:

                      `timestamp`:   (Date) when the version was created
                      `revision`:    (String) reference of version in SCM
                      `creator`:     (String) email address of developer who deployed the version
                      `description`: (String) summary of the version

```

### Advanced Plugin Configuration

As mentioned above, by default, all plugins from installed addons will be loaded, and
ordered based on ember-cli's order of the addons. Developers may have advanced use cases
for specifying the order of plugins, disabling plugins, or configuring a single plugin to
be configured and used twice.

If you want to opt-into this configuration, you can set the `plugins` property in your `config/deploy.js` file at either the top-level (for global configuration), or under an environment (for per-environment configuration).

```
plugins: ["s3-assets", "s3-index", "notify-slack"]
```

Any plugins not included in the list will not have their hooks executed.

To include a plugin twice, alias it using a colon.

```
plugins: ["s3-assets:foo-assets", "s3-assets:bar-assets", "s3-index", "notify-slack"]
```

The name specified after the colon will be passed as the `name` property
of the `options` argument to the addon's `createDeployPlugin` method. Plugins
should use their name to retrieve configuration values. In this example,
the foo-assets instance of the s3-assets plugin could have different configuration
than the bar-assets instance does.
