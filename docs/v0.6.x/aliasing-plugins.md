---
title: Aliasing Plugins
---

Often it is necessary to invoke an instance of a plugin more than once, for instance using the s3 plugin to push assets to two different buckets.

We can do this by using the `pipeline.alias` config option, like so:

```javascript
  var ENV = {
    pipeline: {
      alias: {
        s3: { as: ['s3', 's3-backup'] },
      },
    },
  };
```

This configuration will then allow you to set different configuration options for the two instances of the s3 plugin, referenced by their alias names, like so:

```javascript
  var ENV = {
    pipeline: {
      alias: {
        s3: { as: ['s3-eu', 's3-us'] },
      },
    },

    s3: {
      bucket: 'bucket-1',
    },

    's3-backup': {
      bucket: 'bucket-2',
    },
  };
```

You can pass either a string or an array of strings in as the alias value like so:

```javascript
  var ENV = {
    pipeline: {
      alias: {
        s3: { as: ['s3', 's3-backup'] },
        redis: { as: 'redis-local' },
      },
    },
  };
```
