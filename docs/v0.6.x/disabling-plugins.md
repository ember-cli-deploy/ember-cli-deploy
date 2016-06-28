---
title: Disabling Plugins
---

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
    pipleline: {
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
