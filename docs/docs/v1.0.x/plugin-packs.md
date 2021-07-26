---
title: Plugin Packs
redirect_from: "docs/v1.0.0-beta/plugin-packs/"
---

## What is a Plugin Pack?

After you have a set of plugins that work for your app, keeping them in sync can be cumbersome, especially if you aim to share the same configuration across multiple applications.

**Plugin Packs** were created to tackle this problem. They are a way to bundle up your whole configuration pipeline into a single addon.

They are Ember CLI addons that will auto install a collection of ember-cli-deploy plugins to satisfy a particular deployment strategy, so you don't have to.

## An example

There are many different **deployment strategies** and setups out there, however we are seeing some common strategies emerging. Plugin packs are designed to encapsulate the logic of these
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

## Core Plugin Packs

The following plugin packs are maintained by the ember-cli-deploy core team:

- [ember-cli-deploy-lightning-pack](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack)


## Community-maintained Plugin Packs

The following plugin packs are developed by community members:

- [ember-cli-deploy-aws-pack](https://github.com/kpfefferle/ember-cli-deploy-aws-pack)
- [ember-cli-deploy-s3-pack](https://github.com/gaurav0/ember-cli-deploy-s3-pack)
- [ember-cli-deploy-azure](https://github.com/duizendnegen/ember-cli-deploy-azure)
- [ember-cli-deploy-front-end-builds-pack](https://github.com/tedconf/ember-cli-deploy-front-end-builds-pack)

## Examples of Internal Company Plugin Packs

The following plugins were created by companies that support multiple Ember apps for their own internal use. They have generously open-sourced them for other people to learn from.

- [ember-cli-deploy-ink-pack](https://github.com/movableink/ember-cli-deploy-ink-pack)
- [ember-cli-deploy-sm-pack](https://github.com/simplymeasured/ember-cli-deploy-sm-pack)
- [ember-cli-deploy-yapp-pack](https://github.com/yappbox/ember-cli-deploy-yapp-pack)
- [ember-cli-deploy-zesty-pack](https://github.com/zestyzesty/ember-cli-deploy-zesty-pack)
- [ember-cli-deploy-pn-pack](https://github.com/PrecisionNutrition/ember-cli-deploy-pn-pack)

## Search for plugin packs

For a live list of all current ember-cli-deploy plugin packs this [npm keyword search](https://npmsearch.com/?q=keywords:ember-cli-deploy-plugin-pack)
