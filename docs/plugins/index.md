---
page_header: Plugins
title: Plugins
---

Plugins allow ember-cli-deploy to create a deployment process that's just right for your app and environment.

### Core Plugins

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


### Community Plugins

The following plugins have been developed by community members:

  - [ember-cli-deploy-azure-blob](https://github.com/duizendnegen/ember-cli-deploy-azure-blob) - deploy assets to Azure Blob
  - [ember-cli-deploy-azure-tables](https://github.com/duizendnegen/ember-cli-deploy-azure-tables) - deploy index.html to Azure Tables
  - [ember-cli-deploy-cloudformation](https://github.com/kaliber5/ember-cli-deploy-cloudformation) - create/update a CloudFormation stack to deploy to
  - [ember-cli-deploy-cloudfront](https://github.com/kpfefferle/ember-cli-deploy-cloudfront) - create a CloudFront invalidation
  - [ember-cli-deploy-couchdb](https://github.com/martinic/ember-cli-deploy-couchdb) - upload to a CouchDB cluster
  - [ember-cli-deploy-cp](https://github.com/dschmidt/ember-cli-deploy-cp) - deploy file(s) on your filesystem
  - [ember-cli-deploy-git-artefacts](https://github.com/scottkidder/ember-cli-deploy-git-artefacts) - creates git artefacts
  - [ember-cli-deploy-git-tag](https://github.com/minutebase/ember-cli-deploy-git-tag) - tag deploys in git
  - [ember-cli-deploy-hipchat](https://github.com/blimmer/ember-cli-deploy-hipchat) - send a message to HipChat
  - [ember-cli-deploy-mysql](https://github.com/mwpastore/ember-cli-deploy-mysql) - deploy index.html to MySQL/MariaDB
  - [ember-cli-deploy-rsync-assets](https://github.com/pixelhandler/ember-cli-deploy-rsync-assets) - deploy app using node-rsync over SSH
  - [ember-cli-deploy-sftp](https://github.com/martinic/ember-cli-deploy-sftp) - deploy app via SFTP
  - [ember-cli-deploy-sql](https://github.com/mwpastore/ember-cli-deploy-sql) - deploy index.html to a database table
  - [ember-cli-deploy-scp](https://github.com/michaljach/ember-cli-deploy-scp) - deploy app using SCP via SSH
  - [ember-cli-deploy-webhooks](https://github.com/simplabs/ember-cli-deploy-webhooks) - call webhooks during deployments
  - [ember-cli-deploy-notify-firebase](https://github.com/minutebase/ember-cli-deploy-notify-firebase) - update a path in Firebase on activation
  - [ember-cli-deploy-sentry](https://github.com/dschmidt/ember-cli-deploy-sentry) - upload javascript sourcemaps to sentry
  - [ember-cli-deploy-rollbar](https://github.com/netguru/ember-cli-deploy-rollbar) - include Rollbar snippet and upload javascript sourcemaps to Rollbar
  - [ember-cli-deploy-simply-ssh](https://github.com/AutoCloud/ember-cli-deploy-simply-ssh) - deploy via SSH with support of `-revision-data`, `-gzip`, `deploy:list` and `deploy:activate`

For a wide view of the plugin ecosystem, check out [a live search of npm packages with the "ember-cli-deploy-plugin" keyword](https://npmsearch.com/?q=keywords:ember-cli-deploy-plugin).

**Ember Observer** has also a [special category](https://emberobserver.com/categories/ember-cli-deploy-plugins) dedicated to deploy plugins.

## Plugin Packs

The following plugin packs are maintained by the Ember CLI deploy core team:

- [ember-cli-deploy-lightning-pack](https://github.com/ember-cli-deploy/ember-cli-deploy-lightning-pack)

The following plugin packs are developed by community members:

- [ember-cli-deploy-aws-pack](https://github.com/kpfefferle/ember-cli-deploy-aws-pack)
- [ember-cli-deploy-s3-pack](https://github.com/gaurav0/ember-cli-deploy-s3-pack)
- [ember-cli-deploy-azure](https://github.com/duizendnegen/ember-cli-deploy-azure)
- [ember-pagefront](https://github.com/pagefront/ember-pagefront)
- [ember-cli-deploy-front-end-builds-pack](https://github.com/tedconf/ember-cli-deploy-front-end-builds-pack)

For a live list of all current ember-cli-deploy plugin packs this [npm keyword search](https://npmsearch.com/?q=keywords:ember-cli-deploy-plugin-pack)

## Compatibility
Custom adapters written for ember-cli-deploy 0.4.x **will not work** with 0.5.x or higher.

In order to help users understand if a plugin is compatible with a given version of ember-cli-deploy a badges system is available.

If you're the author of a plugin please open a PR on the [ember-cli-deploy-version-badges](https://github.com/ember-cli-deploy/ember-cli-deploy-version-badges) github repo by following the instructions on the README.

Once your PR is merged you'll be able to put a link to the generated SVG.

example:

[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-s3.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)

```html
[![](https://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/plugins/ember-cli-deploy-s3.svg)](http://ember-cli-deploy.github.io/ember-cli-deploy-version-badges/)
```

Anyone needing assistance in porting a 0.4.x custom adapter to a 0.5+ plugin can [open an issue on the ember-cli-deploy Github repository](https://github.com/ember-cli-deploy/ember-cli-deploy/issues) and we'll be happy to help.
