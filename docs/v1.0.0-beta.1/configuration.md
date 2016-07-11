---
title: Configuration
---

## Usage:

App developers use `config/deploy.js` to return a function that receives the build environment as a string and returns either a config object or a Promise that fulfills with a config object.

The config object has properties corresponding to the name of the plugin (e.g. for ember-cli-deploy-redis, the property is “redis”).

Examples:

```javascript
// deploy.js (sync)
module.exports = function(environment){
  var ENV = {
  };

  if (environment === 'production') {
    ENV.redis = {
      url: process.env.REDIS_URL
    }
  };
  return ENV;
};
```

```javascript
// deploy.js (async)
module.exports = function(environment){
  var ENV = {
    redis: {
    }
  }
  return someAsyncDataRetrieval(environment).then(function(data){
    ENV.redis = data.redisUrl;
    return ENV;
  }
};
```

Individual config properties can be pure values or functions that receive the [context](../the-deployment-context) object and return a value.

```javascript
module.export function(environment){
  var ENV = {
    redis: {
      revisionKey: function(context) {
        return context.deployment.tag;
      }
    }
  }
};
```

## Additional Environments

You may wish to have an environment, such as staging, be built as if it where a different environment, like production. You can accomplish this by setting the `build.environment` property to the desired environment you wish it to be built as. This will now be the environment that gets passed to the ember asset build, and used in `config/environment.js` for example.

```javascript
module.exports = function(environment){
  var ENV = {
  };

  if (environment === 'qa') {
    ENV.build.environment = 'development';
  };
  if (environment === 'staging') {
    ENV.build.environment = 'production';
  };
  return ENV;
};
```

If you need to have the original environment that was passed into the `ember build` command, this can be obtained under the environment variable of `DEPLOY_TARGET` and referenced in any node.js context with `process.env.DEPLOY_TARGET`. Those contexts include evaluation of your `config/deploy.js` file and your `ember-cli-build.js` file.

## Advanced Plugin Configuration

By default, all plugins from installed addons will be loaded, and
ordered based on ember-cli's order of the addons. Developers may have advanced use cases
for specifying the order of plugins, disabling plugins, or configuring a single plugin to
be configured and used twice.

If you want to opt-into this configuration, you can set the `plugins` property in your `config/deploy.js` file at either the top-level (for global configuration), or under an environment (for per-environment configuration).

### Aliases

To include a plugin multiple times you can use the `pipeline.alias` config option, like so:

```javascript
  var ENV = {
    pipeline: {
      alias: {
        s3: { as: ['s3', 's3-backup'] },
      },
    },
  };
```

See [the dedicated cookbook page](../including-a-plugin-twice) for more details.

### Plugin Run Order

By default, the order that plugins are executed in the pipeline comes down to the natural order that they are loaded by EmberCLI.

If you need to have more control over the order in which plugins are executed, use the `pipeline.runOrder` config options, like this:

```javascript
var ENV = {
  pipeline: {
    runOrder: {
      s3: { before: 'redis' },
      'json-config': { after: 'build' }
    },
  },
};
```

This will ensure that no matter what order the plugins are loaded in, `s3` will always run before `redis` and `json-config` will always run after `build`.

You can also use an array of plugin names as well as refer to aliases:

```javascript
var ENV = {
  pipeline: {
    alias: {
      s3: { as: ['s3-prod', 's3-backup'] },
    },

    runOrder: {
      redis: { after: ['s3-prod', 's3-backup'], before: 'slack-notifier' },
    },
  },
};
```

### Disabling Plugins

Sometimes it's desirable to ensure a particular plugin doesn't run for a particular deploy target. To do this, use the `pipeline.disabled` config property, like this:

```javascript
module.exports = function(deployTarget) {
  var ENV = {
    //config here
  };

  if (deployTarget === 'development') {
    ENV.pipeline = {
      disabled: {
        redis: true,
      },
    },
  }

  return ENV;
};
```

The above example will disable the redis plugin from executing when the deployTarget is `development`. For all other deployTargets, it will run.

You can also disable aliased instances of plugins too:

```javascript
module.exports = function(deployTarget) {
  var ENV = {
    pipeline: {
      alias: {
        s3: { as: ['s3-stage', 's3-prod'] },
      },
    },

    //config here
  };

  if (deployTarget === 'stage') {
    ENV.pipeline = {
      disabled: {
        's3-prod': true,
      },
    },
  }

  return ENV;
};
```

Finally if you want to run **only** some plugins you can use the `allExcept` option:


```javascript
module.exports = function(deployTarget) {
  var ENV = {
    pipeline: {
      disabled: {
        allExcept: ['redis']
      },
    },
  };

  return ENV;
};
```
