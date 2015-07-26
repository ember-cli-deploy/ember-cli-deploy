---
title: Commands
---

This Ember-CLI Addon adds multiple deployment related tasks to your Ember-CLI App.

* `ember deploy:assets` Uploads your production assets to a static file hoster.
* `ember deploy:index` Uploads a bootstrap index.html to a key-value store.
* `ember deploy:list` Lists all currently uploaded `revisions` of bootstrap index.html files in your key-value store.
* `ember deploy:activate` Activates an uploaded `revision`. This will set the `<your-project-name>:current` revision to the passed revision. `<your-project-name>:current` is the revision you will serve your users as default.
* `ember deploy` This commands builds your ember application, uploads it to your file hoster and uploads it to your key value store in one step.

You can pass `--environment <some-environment>` to every command. If you don't pass an environment explicitly `ember-cli-deploy` will use the `development`-environment.

You can pass `--deploy-config-file <path/to/deploy-config.js>` to every command. If you don't pass a deploy-config-file explicitly `config/deploy.js` will be read.
