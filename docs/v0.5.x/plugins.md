---
title: Plugins
---

The following plugins are maintained by the ember-cli-deploy core team:

  - [ember-cli-deploy-build](https://github.com/ember-cli-deploy/ember-cli-deploy-build) - build your app
  - [ember-cli-deploy-display-revisions](https://github.com/ember-cli-deploy/ember-cli-deploy-display-revisions) - Display a list of deployed revisions
  - [ember-cli-deploy-gzip](https://github.com/ember-cli-deploy/ember-cli-deploy-gzip) - gzip files
  - [ember-cli-deploy-json-config](https://github.com/ember-cli-deploy/ember-cli-deploy-json-config) - convert index.html to json config
  - [ember-cli-deploy-manifest](https://github.com/ember-cli-deploy/ember-cli-deploy-manifest) - generate a manifest
  - [ember-cli-deploy-redis](https://github.com/ember-cli-deploy/ember-cli-deploy-redis) - upload to redis
  - [ember-cli-deploy-revision-data](https://github.com/ember-cli-deploy/ember-cli-deploy-revision-data) - generate data about this deploy revision including a unique revision key based on the current build
  - [ember-cli-deploy-s3](https://github.com/ember-cli-deploy/ember-cli-deploy-s3) - upload to s3
  - [ember-cli-deploy-s3-index](https://github.com/ember-cli-deploy/ember-cli-deploy-s3-index) - deploy index.html to s3
  - [ember-cli-deploy-ssh-tunnel](https://github.com/ember-cli-deploy/ember-cli-deploy-ssh-tunnel) - open an ssh tunnel during your deploy
  - [ember-cli-deploy-slack](https://github.com/ember-cli-deploy/ember-cli-deploy-slack) - send a message to Slack

The following plugins have been developed by community members:

  - [ember-cli-deploy-azure-blob](https://github.com/duizendnegen/ember-cli-deploy-azure-blob) - deploy assets to Azure Blob
  - [ember-cli-deploy-azure-tables](https://github.com/duizendnegen/ember-cli-deploy-azure-tables) - deploy index.html to Azure Tables
  - [ember-cli-deploy-cloudfront](https://github.com/kpfefferle/ember-cli-deploy-cloudfront) - create a CloudFront invalidation
  - [ember-cli-deploy-cp](https://github.com/dschmidt/ember-cli-deploy-cp) - deploy file(s) on your filesystem
  - [ember-cli-deploy-git-tag](https://github.com/minutebase/ember-cli-deploy-git-tag) - tag deploys in git
  - [ember-cli-deploy-hipchat](https://github.com/blimmer/ember-cli-deploy-hipchat) - send a message to HipChat
  - [ember-cli-deploy-notifications](https://github.com/simplabs/ember-cli-deploy-notifications) - notify external services of successful deploys
  - [ember-cli-deploy-notify-firebase](https://github.com/minutebase/ember-cli-deploy-notify-firebase) - update a path in Firebase on activation
  - [ember-cli-deploy-sentry](https://github.com/dschmidt/ember-cli-deploy-sentry) - upload javascript sourcemaps to sentry

For a wide view of the plugin ecosystem, check out [a live search of npm packages with the "ember-cli-deploy-plugin" keyword](https://npmsearch.com/?q=keywords:ember-cli-deploy-plugin).

## Compatibility
Custom adapters written for ember-cli-deploy 0.4.x **will not work** with 0.5.x.

In order to help users understand if a plugin is compatible with a given version of ember-cli-deploy a badges system is available.

If you're the author of a plugin please open a PR on the
[ember-cli-deploy-version-badges](https://github.com/ember-cli-deploy/ember-cli-deploy-version-badges) github repo by following the instructions on the README.

Once your PR is merged you'll be able to put a link to the generated SVG.

example:

[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-s3.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)

```html
[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-s3.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)
```

Anyone needing assistance in porting a 0.4.x custom adapter to a 0.5.x plugin can [open an issue on the ember-cli-deploy Github repository](https://github.com/ember-cli/ember-cli-deploy/issues) and we'll be happy to help.
