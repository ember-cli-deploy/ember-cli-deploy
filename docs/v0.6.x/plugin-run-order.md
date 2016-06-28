---
title: Plugin Run Order
---

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
