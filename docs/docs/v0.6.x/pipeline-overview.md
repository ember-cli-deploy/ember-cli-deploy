---
title: Deployment Pipeline Overview
---

When you run a command like `ember deploy`, `ember deploy:list` or `ember deploy:activate`, you're executing an ember-cli-deploy pipeline.

A pipeline is initialized with a different sequence of [hooks](../pipeline-hooks) depending on which command you are running. Then ember-cli-deploy finds all the [ember-cli-deploy-plugins](../plugins) that your app has installed and registers them.

The actual execution of the pipeline consists of moving through each hook in sequence, and running the matching hook functions provided by the plugins. As execution proceeds, the [context](../deployment-context) is constantly updated and passed to the subsequent plugin hook functions. In the case of an error, the pipeline will invoke a special `didFail` hook on any plugins which support it and abort execution.
