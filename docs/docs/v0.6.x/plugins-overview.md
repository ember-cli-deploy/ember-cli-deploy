---
title: Plugins overview
---

A plugin is an ember-cli addon that works with the ember-cli-deploy [pipeline](../pipeline-overview) in order to add functionality to a deploy or related operation. [Plugins](../plugins) allow you to do anything from uploading assets to S3, writing the `index.html` to Redis, or notifying a Slack channel a deploy has completed.

In general, ember-cli-deploy plugins focus on doing a specific task. Most Ember developers with common deployment targets can compose some of the opensource plugins available to create a deployment process that fits their needs.

Developers with very custom needs might create a single private plugin that implements all aspects of their deployment process within the structure provided by ember-cli-deploy. Or more likely, they would mix in a custom plugin or two with a selection of opensource plugins.
