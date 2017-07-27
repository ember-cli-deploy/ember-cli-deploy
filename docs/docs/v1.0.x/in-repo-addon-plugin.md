---
title: Creating a plugin as an in-repo-addon
---

So, you want to prototype a plugin or write one that is so specific to your app that it's not worth making a new npm package for?

Ember CLI allows you to create addons that exist within an existing repository. Here's how to make an ember-cli-deploy as an in-repo-addon.

Generate the plugin
-------------------

First, use the handy ember-cli generator for creating an in-repo-addon. Don't forget to name the plugin starting with `ember-cli-deploy-`.

```sh
ember generate in-repo-addon ember-cli-deploy-my-funky-plugin
```

This will generate two files:

1. `lib/ember-cli-deploy-my-funky-plugin/package.json`
2. `lib/ember-cli-deploy-my-funky-plugin/index.js`

Identify the addon as an ember-cli-deploy plugin
------------------------------------------------

Given the plugin is named appropriately, all that's left is to identify the plugin as an ember-cli-deploy plugin in `package.json`.

To do this, add `ember-cli-deploy-plugin` to the `keywords` section:

```js
// package.json
{
  "name": "ember-cli-deploy-my-funky-plugin",
  "keywords": [
    "ember-addon",
    "ember-cli-deploy-plugin"
  ]
}
```

Implement one or more pipeline hooks
------------------------------------

Now, follow the directions in [Creating a plugin](../creating-a-plugin/#the-anatomy-of-a-plugin) to implement pipeline hooks in the `index.js` file in your in-repo-addon.
