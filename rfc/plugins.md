# Plugins

A plugin is an ember-cli addon that hooks into the ember-cli-deploy
pipeline in order to add functionality to a deploy. Example addon
functionality would be uploading assets to S3, writing the index.html to
Redis, or notifying a Slack channel a deploy has completed.

Plugins should focus on doing a specific task. Most Ember developers
with common deployment targets will compose and combine multiple plugins
to fine tune their deployment process. Developers with very custom needs
might create a single private plugin that implements all aspects of their
deployment process within the structure provided by ember-cli-deploy.

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
ember-cli addons. In future versions, we may add a configuration option
to disable this automatic use of plugins, to allow more flexibility.

### Plugins are provided by ember-cli addons

Plugins are ember-cli addons which implement an `createDeployPlugin()` method
to return an object which implements one or more methods that are called by
ember-cli-deploy. For example:

```javascript
module.exports = {
  name: 'ember-cli-deploy-example-plugin',
  createDeployPlugin: function(){
    return {
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

### Hooks

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
              \
               \-- didUpload    notify APIs (slack, pusher, etc.), warm cache

               /-- willActivate   create backup of assets, notify APIs, uninstall earlier versions
              /
    activate -------> make a new version live (clear cache, swap Redis values, etc.)
              \
               \-- didActivate    notify APIs, warm cache

    didDeploy: --> runs at the end of a full deployment operation.
```

