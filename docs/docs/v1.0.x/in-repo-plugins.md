---
title: Creating in-repo plugins
---

So, you want to prototype a plugin or write one that is so specific to your app that it should live within the same repository as your app?

Ember CLI allows you to create addons that exist within an existing repository and this can be done with ember-cli-deploy plugins.

If there's any chance a plugin would be useful to the greater community, it is preferred that a plugin be published as an open-source addon. A plugin is a good candidate for an in-repo-addon if it is unlikely to be used by any other project.

Here's how to make an ember-cli-deploy as an in-repo-addon.

Generate the plugin
-------------------

First, use the handy ember-cli generator for creating an in-repo-addon.

```sh
ember generate in-repo-addon ember-cli-deploy-my-funky-plugin
```

This will generate two files:

1. `lib/ember-cli-deploy-my-funky-plugin/package.json`
2. `lib/ember-cli-deploy-my-funky-plugin/index.js`

Identify the addon as an ember-cli-deploy plugin
------------------------------------------------

Now all that's left is to identify the plugin as an ember-cli-deploy plugin in `package.json`.

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
