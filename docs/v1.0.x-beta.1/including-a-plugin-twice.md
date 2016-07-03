---
title: Including a plugin twice
---

## Aliasing Plugins

To include a plugin twice, alias it using a colon.

```javascript
plugins: ["s3-assets:foo-assets",
          "s3-assets:bar-assets",
          "s3-index",
          "notify-slack"]
```

The name specified after the colon will be passed as the `name` property
of the `options` argument to the addon's `createDeployPlugin` method. Plugins
should use their name to retrieve configuration values. In this example,
the foo-assets instance of the s3-assets plugin could have different configuration
than the bar-assets instance does.

Example:

```javascript
module.exports = function(deployTarget) {
  var ENV = {
    plugins: ['build', 'revision-key', 'redis:prod1-redis', 'redis:prod2-redis'],
  };
  if (deployTarget === 'production') {
    ENV['prod1-redis'] = {
      keyPrefix: 'app',
      allowOverwrite: true,
      host: 'prod1.com',
      port: 6379
    };
    ENV['prod2-redis'] = {
      keyPrefix: 'app',
      allowOverwrite: true,
      host: 'prod2.com',
      port: 6379
    };
    ...
  }

  return ENV;
};
```
