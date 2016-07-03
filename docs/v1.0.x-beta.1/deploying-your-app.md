---
title: Deploying your app
---

Once you have your configuration ready it's time to deploy!

## Deploy targets

As shown in the [quickstart](../quickstart) guide the configuration function will get passed a single parameter conventionally called `deployTarget`;

The `deployTarget` can be any string that is passed as a third argument to the [commands](../usage) (`production` is the default value)

This paramenter allows to customize the configuration based on where you're deploying.

A common approach is to set some defaults and then customize the plugins [configuration](../configuration) for each `deployTarget` (i.e. API keys, host IPs, ports etc); this process is very similar to what is done in your `config/environment.js`;

## Deploy

To deploy your application to your `production` target run:

```
ember deploy production --verbose
```

With the `--verbose` flag, you'll be able to see what each plugin is doing in all the different [pipeline hooks](../pipeline-hooks). This is a useful way to debug your setup especially during the inital setup phase.

## Activation

Many of the Ember CLI Deploy [plugins](/plugins) that are meant to be used to manage your `index.html` support another deploy command called **activate**.

The idea is that your normal deploy (i.e `ember deploy production`) will take care of uploading the assets (js/css/images/etc.) to their destination as well as your `index.html` but the latter will be renamed for later use.

The convention is to use a plugin like [ember-cli-deploy-revision-data](https://github.com/ember-cli-deploy/ember-cli-deploy-revision-data) to generate this information for every release but you can customize this behaviour.

The **activate** command receives a `--revision=` parameter and your plugins will take care of switching your current active `index.html` with the one matching the specified revision.

```
ember deploy:activate TARGET --revision=REVISION
```

`--activate` can also be passed as a parameter to the deploy command `ember deploy` to immediately activate the revision being deployed.

## Listing

If your strategy allows for multiple revisions it's useful to be able to list them and
see which one is currently activated using the `list` command

```
ember deploy:list TARGET
```

You'll need to add at least one plugin to your pipeline that implements the required functionality to "display" the results, a good starting point is [ember-cli-deploy-display-revisions](https://github.com/ember-cli-deploy/ember-cli-deploy-display-revisions)
