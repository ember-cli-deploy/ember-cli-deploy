---
title: Custom adapters overview
---

`ember-cli-deploy` is built around the idea of adapters for the bootstrap-index- and the assets-uploads. For `ember-cli-deploy` to give you the deployment approach Luke talks about in his talk you will for example need to install the `ember-deploy-redis` and `ember-deploy-s3` adapters via npm.

Because `ember-cli-deploy` is built with adapters in mind you can write your own adapters for your project specific use cases.

Custom Adapters can be integrated via custom [Ember-CLI-Addons](http://www.ember-cli.com/#developing-addons-and-blueprints). For `ember-cli-deploy` to integrate your custom adapter addons you have to define your addon-type as an `ember-deploy-addon`.

You can have a look at [ember-deploy-s3](https://github.com/LevelbossMike/ember-deploy-s3) and [ember-deploy-redis](https://github.com/LevelbossMike/ember-deploy-redis) to get an idea how one would implement 'real-world'-adapters.

For the sake of clarity here's a quick example of how you will structure your addon to add custom adapters.

```js
//index.js in your custom addon

var SuperAwesomeCustomIndexAdapter = require('./lib/index-adapter');

function EmberDeploySuperAwesome() {
  this.name = 'ember-deploy-super-awesome';
  this.type = 'ember-deploy-addon';

  // ember-cli-deploy will merge ember-deploy-addon's adapters property
  this.adapters = {
    index: {
      'super-awesome': SuperAwesomeCustomIndexAdapter
    },
    assets: {
      // you can add multiple adapters in one ember-deploy-addon
    },

    tagging: {
      // you can add multiple adapters in one ember-deploy-addon
    }
  };
}

module.exports = EmberDeploySuperAwesome;
```

Because `ember-cli-deploy` will simply merge an `ember-deploy-addon`'s adapters property into its own bundled adapter-registry you could in theory bundle a complete new approach for deploying in one addon (just add an index- and an asset-adapter).

After adding your custom ember-deploy-addon to your project as an ember-cli-addon you can then use your custom adapters in ember-cli-deploy's deploy.json:

```js
{
  "development": {
    "store": {
      "type": "super-awesome",
      // .. whatever additional config your adapter needs
    },
    "assets": {
      "accessKeyId": "<your-access-key-goes-here>",
      "secretAccessKey": "<your-secret-access-key-goes-here>",
      "bucket": "<your-bucket-name>"
    }
  },
  //...
}
```
