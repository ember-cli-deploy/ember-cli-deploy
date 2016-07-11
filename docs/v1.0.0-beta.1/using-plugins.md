---
title: Using plugins
---

Once you've [identified your needs](../determining-needs), the next step is to configure your deploy pipeline with plugins that accomplish these tasks.

## What is a plugin

A plugin is an ember-cli addon that works with the Ember CLI Deploy [pipeline](../pipeline-hooks) in order to add functionality to a deploy or related operation. [Plugins](/plugins) allow you to do anything from uploading assets to S3, writing the `index.html` to Redis, or notifying a Slack channel a deploy has completed.

In general, Ember CLI Deploy plugins focus on doing a specific task. Most Ember developers with common deployment targets can compose some of the opensource plugins available to create a deployment process that fits their needs.

Developers with very custom needs might create a single private plugin that implements all aspects of their deployment process within the structure provided by ember-cli-deploy. Or more likely, they would mix in a custom plugin or two with a selection of opensource plugins.

## What is the deploy pipeline

When you run a command like `ember deploy`, `ember deploy:list` or `ember deploy:activate`, you're executing an Ember CLI Deploy pipeline.

A pipeline is initialized with a different sequence of [hooks](../pipeline-hooks) depending on which command you are running. Then Ember CLI Deploy finds all the [ember-cli-deploy-plugins](/plugins) that your app has installed and registers them.

The actual execution of the pipeline consists of moving through each hook in sequence, and running the matching hook functions provided by the plugins. As execution proceeds, the [context](../the-deployment-context) is constantly updated and passed to the subsequent plugin hook functions.


## How to choose a plugin

After [deciding](../determining-needs) your deploy structure, the best thing to do is look through the [existing plugins](/plugins), odds are that someone else in the community has implemented what you need.

It's also a good idea to ask for advice on the `#ec-deploy` channel of the [ember community slack](https://ember-community-slackin.herokuapp.com/).

If everything else fails then it's time to [write your own](../creating-a-plugin).

## Adding Plugins

To add a plugin to your project simply `ember install`-it like any other ember-cli addon.

```
ember install ember-cli-deploy-build
```

## Configuring Plugins

Once you have installed all the necessary plugins you can start editing `config/deploy.js` to add the required [configuration](../configuration) for each one of them.

Each plugin's README normally lists all the exposed configuration options (i.e. [ember-cli-deploy-build](https://github.com/ember-cli-deploy/ember-cli-deploy-build#configuration-options))


### Example

This is a possible configuration for an app that deploys both assets and `index.html` to S3 using

* ember-cli-deploy-build
* ember-cli-deploy-revision-data
* ember-cli-deploy-s3
* ember-cli-deploy-s3-index

```js
module.exports = function(deployTarget) {
  var ENV = {
    build: {}
    // include other plugin configuration
    // that applies to all deploy targets here
  };

  // configure other plugins for production deploy target here
  if (deployTarget === 'production') {
    ENV.build.environment = 'production';

    ENV.s3 = {
      accessKeyId: process.env['AWS_ACCESS_KEY'],
      secretAccessKey: process.env['AWS_SECRET_KEY'],
      bucket: 'ember-cli-deploy-intro',
      region: 'us-west-2'
    };
    ENV['s3-index'] = {
      accessKeyId: process.env['AWS_ACCESS_KEY'],
      secretAccessKey: process.env['AWS_SECRET_KEY'],
      bucket: 'ember-cli-deploy-intro',
      region: 'us-west-2',
      allowOverwrite: true
    };
  }

  return ENV;
};
```

You can see the full example at [ember-cli-deploy-introduction](https://github.com/ghedamat/ember-cli-deploy-introduction)
