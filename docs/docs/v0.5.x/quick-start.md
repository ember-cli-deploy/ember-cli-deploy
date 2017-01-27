---
title: Quick start
---

If you want to get started with ember-cli-deploy quickly and have a good idea of the deployment setup you would like to use then simply follow these steps:

- Install ember-cli-deploy

```bash
ember install ember-cli-deploy
```

- Install the build plugin to build your project

```bash
ember install ember-cli-deploy-build
```

- Install any other plugins you need to satisfy your desired deployment strategy. You can see find a list of the available plugins on the [Plugin Page](../plugins).

- Deploy your application

```bash
ember deploy production
```

## Understanding your deployment strategy

While ember-cli-deploy is very good at deploying your Ember application, there are a few things it needs you to setup in order to tell it what to deploy and where.

A deployment strategy is often very unique to a particular application or company and they are not something that can really be derived automatically by conventions.

Head on over to the [Deployment Strategies](../deployment-strategies-overview) section to understand what makes a good deployment strategy and how you can start
implementing yours with ember-cli-deploy.
