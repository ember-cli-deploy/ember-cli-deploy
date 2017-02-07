---
title: Creating a plugin pack
redirect_from: "docs/v1.0.0-beta/creating-a-plugin-pack/"
---

## Why would I create a Plugin Pack?

There are a few reasons why you might want to create your own plugin pack.

The first might be that you want to package up your deployment strategy so it's easy for you to implement across multiple ember-cli projects. This would save you the time of having to install all of the
required plugins in every project. We envision most companies that support multiple Ember apps creating their own plugin packs for internal use.

The second reason you might create a plugin pack is to contribute your deployment strategy ideas back to the ember-cli-deploy community. By publishing a plugin pack, you are telling the community that you believe you know of a
good deployment strategy for ember-cli apps and you are showing them how they can implement that strategy with minimal effort.

Both of these reasons come down to making it as easy as possible to get deploying quickly.

Plugin packs also reduce and centralize maintenance because updating versions of individual plugins happens in the plugin pack's `package.json`. Consuming applications need only update the plugin pack's version in order to get
the up to date versions of the individual plugins.

## So how do I create a Plugin Pack?

It's easy! As mentioned before, a plugin pack is simply an ember-cli addon. All you need to do is this:

First create an ember-cli-addon:

```bash
ember addon ember-cli-deploy-my-plugin-pack
```

Then you want to add the plugin pack keyword to `package.json` like this:

```javascript
// package.json

"keywords": [
  "ember-addon",
  "ember-cli-deploy-plugin-pack"
]
```

Finally you will need to add the plugins that you would like this plugin pack to install, to the the package.json:

```javascript
// package.json

"dependencies": {
  "ember-cli-deploy-build": "0.1.0-beta.1",
  "ember-cli-deploy-s3": "0.1.0-beta.1",
  "ember-cli-deploy-redis": "0.1.0-beta.1"
}

```

Then if you would like to be a good citizen of the ember-cli-deploy world, you might create a blueprint to generate an example `config/deploy.js` for this particular plugin setup.
See the [ember-cli-deploy-lightning-pack blueprint](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack/tree/master/blueprints/lightning-deploy-config) as an example.

To allow the plugin to provide shared code for use in config, you can require functions from your config/deploy.js. For an example of this, see [ember-cli-deploy-yapp-pack](https://github.com/yappbox/ember-cli-deploy-yapp-pack) and how its [blueprint config file uses code](https://github.com/yappbox/ember-cli-deploy-yapp-pack/blob/master/blueprints/yapp-deploy-config/files/config/deploy.js) that is [provided by its index.js file](https://github.com/yappbox/ember-cli-deploy-yapp-pack/blob/master/index.js#L6-L121).
