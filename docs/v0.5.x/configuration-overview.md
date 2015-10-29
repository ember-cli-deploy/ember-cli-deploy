---
title: Configuration Overview
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
    Env.redis = {
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

Individual config properties can be pure values or functions that receive the [context](../deployment-context) object and return a value.

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

### Advanced Plugin Configuration

By default, all plugins from installed addons will be loaded, and
ordered based on ember-cli's order of the addons. Developers may have advanced use cases
for specifying the order of plugins, disabling plugins, or configuring a single plugin to
be configured and used twice.
If you want to opt-into this configuration, you can set the `plugins` property in your `config/deploy.js` file at either the top-level (for global configuration), or under an environment (for per-environment configuration).

```javascript
plugins: ["s3-assets", "s3-index", "notify-slack"]
```

Any plugins not included in the list will not have their hooks executed.

It's also possible to [alias plugins](../aliasing-plugins).
