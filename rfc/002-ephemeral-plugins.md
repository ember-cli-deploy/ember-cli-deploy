# Summary

Implement a way for users to define plugins, on an adhoc basis, from within the `config/deploy.js` file thus removing the need for creating new repos or in-repo addons.


# Motivation

This idea has been floated many a time by various users in the Ember community and each time we've pushed back stating that in-repo addons are sufficient and low friction enough for quickly creating a low maintenance plugin.

However, as time as moved on, I believe there is a world where being able to define a plugin from within the `config/deploy.js` file is valuable. While in-repo addons are very light weight, and "low friction", there is still work that needs to take place to put these in place, and when the goal is to debug something in the deploy pipeline or validate something on the `context`, even creating an in-repo addon can feel like more work than is necessary.

Therefore, I think it's worthwhile exploring what plugins, defined in the `config/deploy.js` file, from here on referred to as *inline plugins*, might look like.


# Detailed design

## Adding a new plugin to the pipeline

The thing that makes a plugin, a plugin, is that it is an object that:

1. Contains a `name` property and;
2. Contains a function, called `createDeployPlugin`, that itself returns an object that contains one or more implemented deploy hooks.

We should provide a place in the `config/deploy.js` file whereby the user can also define plugins. The property could be something like `pipeline.inlinePlugins`.

In it's simplest form, an inline plugin could be defined as an object like so:

```js
module.exports = function(deployTarget) {
  return {
    pipeline: {
      inlinePlugins: [
        {
           name: 'log-to-console',
           createDeployPlugin(options) {
             return {
              name: options.name,

              willDeploy() {
                console.log('About to deploy');
              },

              didBuild(context) {
                console.log(`Project files built in: ${context.distDir}`);
              },

              didDeploy() {
                console.log('Finished deploying');
              }
            };
          }
        }
      ]
    },

    redis: {
      url: process.env.REDIS_URL
    }
  };
};
```

Of course, just like a standalone plugin, it's possible to also use the [base plugin](https://github.com/ember-cli-deploy/ember-cli-deploy-plugin) like so:

```js
var DeployPluginBase = require('ember-cli-deploy-plugin');

module.exports = function(deployTarget) {
  return {
    pipeline: {
      inlinePlugins: [
        {
           name: 'log-to-console',

           createDeployPlugin(options) {
             var DeployPlugin = DeployPluginBase.extend({
              name: options.name,

              defaultConfig: {
                someKey: 'defaultValue'
              },

              requiredConfig: ['awesomeApiKey'],

              didBuild(context) {
                console.log(`Project files built in: ${context.distDir}`);
              }
             });

             return new DeployPlugin();
           }
        }
      ]
    },

    redis: {
      url: process.env.REDIS_URL
    }
  };
};
```


As a part of the plugin discovery that the [plugin-registry.js](https://github.com/ember-cli-deploy/ember-cli-deploy/blob/master/lib/models/plugin-registry.js) does, it could look in the `pipeline.inlinePlugins` property of `config/deploy.js` after discovering the plugins from addons, and merge the resultant plugins in to the list. Everything after that point should work as normal.

This way, users should be able to configure their inline plugins the same way they do normal ones, maintaining the ability to do things such as disable them, reorder them etc etc.

# How we teach this

We need to ensure that the naming of the configuration property is intention revealing. After that we need to add details to the ember-cli-deploy.com docs.


# Drawbacks

I can't see any real drawbacks here. It makes sense to be able to create plugins like this on the fly. In-repo addons aren't really testable so we aren't really losing that ability.


# Alternatives

Carry on recommending in-repo addons.


# Unresolved questions
- Should we somehow warn/error if plugins have defined a `pipeline` config property for a plugin?
- Should we enforce the need for the `ember-cli-deploy` prefix of an inline plugin name? My initial thoughts are no as it adds no value. But my gut then suggests that it introduces a difference between standalone and inline plugins.

# Tradeoffs / Decisions
- Decided to move the (re)implementing hooks in existing addons to a separate RFC due to lack of clarity around how it should work
