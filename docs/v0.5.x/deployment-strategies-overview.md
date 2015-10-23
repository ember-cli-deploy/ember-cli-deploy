---
title: Deployment Strategies Overview
---

Before starting to use ember-cli-deploy you need to decide what you want your deployment strategy to be.

* Are you going to deploy the ember app every time you deploy your backend?
* Are you going to deploy frontend and backend independently?
* Will the backend serve your index.html and assets or only one or neither?

All these approaches have pros and cons that vary depending on your app.

A popular approach that spearheaded the original ember-cli-deploy project is the [lighting strategy](../the-lightning-strategy) but with the [plugin system](../plugins-overview) you now have all the freedom you need.


## What is a deployment strategy?

Any deploy process needs to do a few things

1. build your project files
2. store the compiled assets somewhere (s3/cloudfront or similar, your own application server, a 3rd party platform)
3. optionally prefix the assets (fingerprinting) so that you don't have to worry about cache invalidation
4. assets gzip for performance boost
5. store and serve the ember-cli `index.html` that points to the created assets
6. notify your team chat of a successful build/deploy **optional**
7. store different *releases* and easily switch between them**optional**

Lots of [plugins](../plugins) are already available and by simply composing them you'll be able to build your own deploy strategy, for the most common strategies [plugin packs](../plugin-packs) are already available to get you up and running in no time!
