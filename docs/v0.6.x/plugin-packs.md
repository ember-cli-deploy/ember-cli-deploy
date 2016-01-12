---
title: Plugin Packs
---

## What is a Plugin Pack?

An ember-cli-deploy plugin pack is an ember-cli addon that will auto install a collection of ember-cli-deploy plugins to satisfy a particular deployment strategy, so you don't have to.

## Why use a Plugin Pack?

There are many different [deployment strategies](../deployment-strategies-overview) and setups out there, however we are seeing some common strategies emerging. Plugin packs are designed to encapsulate the logic of these
deployment strategies and give you all the plugins you need to benefit from a particular deployment strategy.

A great example of a common deployment strategy is, what has in recent times been coined, [The Lightning Approach](https://www.youtube.com/watch?v=QZVYP3cPcWQ) to deployment. This strategy involves pushing an
index.html file to Redis and assets to S3. But there are also a bunch of other things that you would want to do with this approach. Therefore, you probably would want to install all
of the following plugins:

- [ember-cli-deploy-build](https://github.com/ember-cli-deploy/ember-cli-deploy-build) - to build your app
- [ember-cli-deploy-revision-data](https://github.com/ember-cli-deploy/ember-cli-deploy-revision-data) - to generate a revision key
- [ember-cli-deploy-gzip](https://github.com/ember-cli-deploy/ember-cli-deploy-gzip) - to gzip files
- [ember-cli-deploy-manifest](https://github.com/ember-cli-deploy/ember-cli-deploy-manifest) - to generate a manifest
- [ember-cli-deploy-redis](https://github.com/ember-cli-deploy/ember-cli-deploy-redis) - to upload to redis
- [ember-cli-deploy-s3](https://github.com/ember-cli-deploy/ember-cli-deploy-s3) - to upload to s3
- [ember-cli-deploy-display-revisions](https://github.com/ember-cli-deploy/ember-cli-deploy-display-revisions) - to display a list of deployed revisions

To make it easier to get up and running with this deployment strategy, you could instead just install the [ember-cli-deploy-lightning-pack](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack). This pack will install the above plugins automatically
and provide you with a blueprint `config/deploy.js`.

## How do I use a Plugin Pack?

A plugin pack is just an ember-cli addon so you just need to install it like you would any addon:

```bash
ember install ember-cli-deploy-lightning-pack
```

From then on, just carry on deploying with [The Lightning Strategy](../the-lightning-strategy).

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


## Core Plugin Packs

The following plugin packs are maintained by the ember-cli-deploy core team:

- [ember-cli-deploy-lightning-pack](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack)


## Community-maintained Plugin Packs

The following plugin packs are developed by community members:

- [ember-cli-deploy-aws-pack](https://github.com/kpfefferle/ember-cli-deploy-aws-pack)
- [ember-cli-deploy-azure](https://github.com/duizendnegen/ember-cli-deploy-azure)
- [ember-pagefront](https://github.com/pagefront/ember-pagefront)
- [ember-cli-deploy-front-end-builds-pack](https://github.com/tedconf/ember-cli-deploy-front-end-builds-pack)

## Examples of Internal Company Plugin Packs

The following plugins were created by companies that support multiple Ember apps for their own internal use. They have generously open-sourced them for other people to learn from.

- [ember-cli-deploy-ink-pack](https://github.com/movableink/ember-cli-deploy-ink-pack)
- [ember-cli-deploy-sm-pack](https://github.com/simplymeasured/ember-cli-deploy-sm-pack)
- [ember-cli-deploy-yapp-pack](https://github.com/yappbox/ember-cli-deploy-yapp-pack)
- [ember-cli-deploy-zesty-pack](https://github.com/zestyzesty/ember-cli-deploy-zesty-pack)

## Search for plugin packs

For a live list of all current ember-cli-deploy plugin packs this [npm keyword search](https://npmsearch.com/?q=keywords:ember-cli-deploy-plugin-pack)
